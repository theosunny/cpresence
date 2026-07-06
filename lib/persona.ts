/**
 * Persona Engine — analyzes user content and generates AI-cloned responses.
 *
 * Architecture:
 *   Layer 1: Style Profile — extract writing characteristics → structured JSON
 *   Layer 2: Knowledge RAG — vectorize user content for retrieval-augmented generation
 *   Layer 3: Generation — compose system prompt + RAG context → LLM → output
 *
 * MVP: Layers 1+3 only (prompt engineering, no vector DB).
 * Post-PMF: Add Layer 2 (pgvector) and switch to fine-tuned open-source model.
 */

import { chat, chatJSON } from "./deepseek";
import { LEAD_SCORING } from "./constants";

// ── Layer 1: Style Profiling ──

export interface StyleProfile {
  tone: string;
  avgSentenceLength: number;
  usesEmoji: boolean;
  emojiFrequency: "never" | "rare" | "moderate" | "heavy";
  commonPhrases: string[];
  commonOpenings: string[];
  commonClosings: string[];
  humorStyle: string;
  formality: number; // 0 (ultra casual) to 1 (formal)
  questionFrequency: number; // 0 to 1
  hashtagStyle: "heavy" | "moderate" | "minimal";
  avgPostLength: number; // characters
  expertiseTopics: string[];
  includesCallToAction: boolean;
}

const STYLE_ANALYSIS_PROMPT = `Analyze the following social media posts from a single user. Extract their writing style profile.

Return a JSON object with these fields:
- tone: overall communication tone (e.g. "casual_professional", "enthusiastic", "analytical", "warm", "direct")
- avgSentenceLength: average number of words per sentence (number)
- usesEmoji: whether they use emojis at all (boolean)
- emojiFrequency: "never" | "rare" | "moderate" | "heavy"
- commonPhrases: list of 5-10 phrases/words they frequently use
- commonOpenings: list of 3-5 ways they typically start posts
- commonClosings: list of 3-5 ways they typically end posts
- humorStyle: describe their humor (e.g. "self_deprecating", "dry", "punny", "none")
- formality: number 0-1, where 0=totally casual and 1=very formal
- questionFrequency: number 0-1, how often they ask questions to engage audience
- hashtagStyle: "heavy" | "moderate" | "minimal"
- avgPostLength: average post length in characters (number)
- expertiseTopics: list of 5-10 topics they frequently write about
- includesCallToAction: whether they usually include a CTA (boolean)

Be precise. Base your analysis ONLY on the provided posts.`;

export async function analyzeStyle(posts: string[]): Promise<StyleProfile> {
  const text = posts.join("\n\n---\n\n");

  try {
    const result = await chatJSON<StyleProfile>([
      { role: "system", content: STYLE_ANALYSIS_PROMPT },
      { role: "user", content: text },
    ]);
    return result;
  } catch (error) {
    console.warn("DeepSeek style analysis failed, using default profile:", error);
    return DEFAULT_STYLE_PROFILE;
  }
}

const DEFAULT_STYLE_PROFILE: StyleProfile = {
  tone: "casual_professional",
  avgSentenceLength: 18,
  usesEmoji: true,
  emojiFrequency: "moderate",
  commonPhrases: [],
  commonOpenings: [],
  commonClosings: [],
  humorStyle: "none",
  formality: 0.3,
  questionFrequency: 0.2,
  hashtagStyle: "minimal",
  avgPostLength: 500,
  expertiseTopics: [],
  includesCallToAction: true,
};

// ── Layer 2: Knowledge RAG (Post-MVP) ──
// For MVP, we use recentPosts directly in the prompt context.
// Post-PMF: add MySQL full-text search or switch to pgvector/Weaviate.

export async function indexUserContent(userId: string, posts: { content: string; id: string }[]) {
  // Store in MySQL via Prisma — each post stored for future RAG retrieval
  const { prisma } = await import("./db");
  for (const post of posts) {
    await prisma.analyticsSnapshot.upsert({
      where: {
        userId_platform_date: {
          userId,
          platform: "x",
          date: new Date(),
        },
      },
      update: { postsCount: { increment: 1 } },
      create: {
        userId,
        platform: "x",
        date: new Date(),
        postsCount: 1,
        followers: 0,
        impressions: 0,
        engagementRate: 0,
        clicks: 0,
        leadsGenerated: 0,
      },
    });
  }
}

// ── Layer 3: Content Generation ──

export interface GenerationContext {
  style: StyleProfile;
  platform: "x" | "tiktok";
  recentPosts: string[]; // last 10 posts for RAG
  topic?: string;
  tone?: string;
  maxLength?: number;
}

export function buildSystemPrompt(context: GenerationContext): string {
  const { style } = context;

  return `You are an AI business partner writing on behalf of your human.

YOUR WRITING STYLE:
- Tone: ${style.tone}
- Average sentence length: ${style.avgSentenceLength} words
- Use emojis: ${style.usesEmoji ? `Yes, ${style.emojiFrequency}` : "No"}
- Formality: ${style.formality < 0.3 ? "Casual" : style.formality < 0.6 ? "Semi-formal" : "Formal"}
- Ask questions to engage: ${style.questionFrequency > 0.3 ? "Frequently" : "Rarely"}
- Hashtag style: ${style.hashtagStyle}
${style.commonPhrases.length > 0 ? `- Common phrases: ${style.commonPhrases.join(", ")}` : ""}
${style.commonOpenings.length > 0 ? `- Typical openings: ${style.commonOpenings.join(", ")}` : ""}
${style.commonClosings.length > 0 ? `- Typical closings: ${style.commonClosings.join(", ")}` : ""}
${style.expertiseTopics.length > 0 ? `- Expertise areas: ${style.expertiseTopics.join(", ")}` : ""}
${style.includesCallToAction ? "- Include a call-to-action when appropriate" : "- Avoid overt calls-to-action"}

PLATFORM: ${context.platform}
${context.maxLength ? `MAX LENGTH: ${context.maxLength} characters` : ""}

RULES:
1. Write in first person ("I", "my", "we") — you ARE this person
2. Stay within the expertise topics listed above — do not claim knowledge you don't have
3. Be authentic and specific — generic content is worthless
4. Never fabricate personal experiences, client names, or specific numbers
5. Match the tone and energy of the human's style profile exactly
6. If unsure about something, lean toward being slightly more professional than the baseline
7. Provide value first, sell second`;
}

export function buildPostPrompt(topic: string, recentPosts: string[]): string {
  const recentContext =
    recentPosts.length > 0
      ? `\n\nRECENT POSTS (for style reference):\n${recentPosts.slice(0, 5).join("\n---\n")}`
      : "";

  return `Write a social media post about: "${topic}"
${recentContext}

The post should feel natural and engaging. Use the writing style described in your system prompt.`;
}

export function buildReplyPrompt(
  originalPost: string,
  replyStyle: string = "helpful"
): string {
  return `Reply to this comment/post in a ${replyStyle} way:

ORIGINAL: "${originalPost}"

Keep your reply authentic and within your expertise. Don't be salesy unless the original comment is explicitly asking about your services.`;
}

export function buildDMPrompt(
  recipientName: string,
  context: string, // why you're messaging them
  goal: string = "introduction"
): string {
  return `Write a direct message to ${recipientName}.

CONTEXT: ${context}
GOAL: ${goal}

Keep it warm but professional. Don't pitch immediately — build rapport first.
Personalize based on any available context about the recipient.`;
}

// ── DeepSeek-Powered Content Generation ──

export async function generatePost(
  context: GenerationContext
): Promise<{ content: string; tokens: number }> {
  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildPostPrompt(context.topic ?? "general business insight", context.recentPosts);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];

  const content = await chat(messages, {
    temperature: 0.8,
    maxTokens: context.maxLength ?? 500,
  });

  return {
    content,
    tokens: content.length, // rough estimate; track via DeepSeek response for accuracy
  };
}

export async function generateReply(
  context: GenerationContext,
  originalPost: string,
  replyStyle: string = "helpful"
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildReplyPrompt(originalPost, replyStyle);

  return chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 300 }
  );
}

export async function generateDM(
  context: GenerationContext,
  recipientName: string,
  dmContext: string,
  goal: string = "introduction"
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildDMPrompt(recipientName, dmContext, goal);

  return chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 400 }
  );
}

// ── Lead Qualification ──

export function scoreLead(
  interactionContent: string,
  interactionType: string
): {
  score: number;
  level: "high" | "medium" | "low";
  signals: { type: string; description: string; weight: number }[];
} {
  const content = interactionContent.toLowerCase();
  const signals: { type: string; description: string; weight: number }[] = [];

  // Strong signals
  for (const kw of LEAD_SCORING.strongSignal.keywords) {
    if (content.includes(kw)) {
      signals.push({
        type: "keyword",
        description: `Mentions "${kw}"`,
        weight: LEAD_SCORING.strongSignal.weight,
      });
      break; // one strong signal is enough
    }
  }

  // Medium signals
  let mediumHits = 0;
  for (const kw of LEAD_SCORING.mediumSignal.keywords) {
    if (content.includes(kw)) {
      mediumHits++;
    }
  }
  if (mediumHits > 0) {
    signals.push({
      type: "keyword",
      description: `${mediumHits} engagement keyword(s)`,
      weight: LEAD_SCORING.mediumSignal.weight * mediumHits,
    });
  }

  // Weak signals
  let weakHits = 0;
  for (const kw of LEAD_SCORING.weakSignal.keywords) {
    if (content.includes(kw)) {
      weakHits++;
    }
  }
  if (weakHits > 0) {
    signals.push({
      type: "keyword",
      description: `${weakHits} positive reaction(s)`,
      weight: LEAD_SCORING.weakSignal.weight * weakHits,
    });
  }

  // DM is a strong behavioral signal
  if (interactionType === "dm") {
    signals.push({
      type: "behavior",
      description: "Sent a direct message",
      weight: 20,
    });
  }

  const totalScore = signals.reduce((sum, s) => sum + s.weight, 0);

  return {
    score: Math.min(totalScore, 100),
    level: totalScore >= 60 ? "high" : totalScore >= 30 ? "medium" : "low",
    signals,
  };
}
