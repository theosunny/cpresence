/**
 * POST /api/persona/analyze
 *
 * Analyze a user's social media posts and return a style profile.
 * Calls DeepSeek V3 to extract writing characteristics.
 * Falls back to default profile if no API key configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/deepseek";
import { getDemoUserId, getOne, run } from "@/lib/db-sqlite";
import type { StyleProfile } from "@/lib/persona";

const STYLE_PROMPT = `Analyze the following social media posts from a single user. Return a JSON object:

{
  "tone": "casual_professional" | "enthusiastic" | "analytical" | "warm" | "direct" | "edgy" | "storyteller",
  "avgSentenceLength": number (avg words per sentence),
  "usesEmoji": boolean,
  "emojiFrequency": "never" | "rare" | "moderate" | "heavy",
  "commonPhrases": string[] (5-10 phrases they frequently use),
  "commonOpenings": string[] (3-5 ways they start posts),
  "commonClosings": string[] (3-5 ways they end posts),
  "humorStyle": "self_deprecating" | "dry" | "punny" | "absurd" | "none",
  "formality": number (0-1, 0=ultra casual, 1=very formal),
  "questionFrequency": number (0-1, how often they ask questions),
  "hashtagStyle": "heavy" | "moderate" | "minimal",
  "avgPostLength": number (characters),
  "expertiseTopics": string[] (5-10 topics),
  "includesCallToAction": boolean
}

Base your analysis ONLY on the provided posts. Be precise.`;

export async function POST(req: NextRequest) {
  try {
    const { posts, platform } = await req.json();
    const userId = getDemoUserId();

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "No posts provided" }, { status: 400 });
    }

    const text = posts.join("\n\n---\n\n");

    let profile: StyleProfile;

    // Try DeepSeek first, fall back to local analysis
    try {
      profile = await chatJSON<StyleProfile>([
        { role: "system", content: STYLE_PROMPT },
        { role: "user", content: text },
      ]);
    } catch (aiError) {
      console.warn("DeepSeek unavailable, using local analysis:", aiError);
      profile = localAnalyzeStyle(posts);
    }

    // Upsert persona in SQLite
    const existing = getOne<{ id: string }>(
      "SELECT id FROM personas WHERE user_id = ? AND platform = ?",
      [userId, platform]
    );

    if (existing) {
      run(
        `UPDATE personas SET
           tone=?, avg_sentence_length=?, uses_emoji=?, emoji_frequency=?,
           common_phrases=?, common_openings=?, common_closings=?,
           humor_style=?, formality=?, question_frequency=?, hashtag_style=?,
           avg_post_length=?, expertise_topics=?, includes_cta=?,
           updated_at=datetime('now')
         WHERE id=?`,
        [
          profile.tone, profile.avgSentenceLength, profile.usesEmoji ? 1 : 0, profile.emojiFrequency,
          JSON.stringify(profile.commonPhrases), JSON.stringify(profile.commonOpenings),
          JSON.stringify(profile.commonClosings),
          profile.humorStyle, profile.formality, profile.questionFrequency, profile.hashtagStyle,
          profile.avgPostLength, JSON.stringify(profile.expertiseTopics),
          profile.includesCallToAction ? 1 : 0,
          existing.id,
        ]
      );
    } else {
      run(
        `INSERT INTO personas (user_id, platform, tone, avg_sentence_length, uses_emoji, emoji_frequency,
          common_phrases, common_openings, common_closings, humor_style, formality,
          question_frequency, hashtag_style, avg_post_length, expertise_topics, includes_cta)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, platform, profile.tone, profile.avgSentenceLength, profile.usesEmoji ? 1 : 0,
          profile.emojiFrequency, JSON.stringify(profile.commonPhrases),
          JSON.stringify(profile.commonOpenings), JSON.stringify(profile.commonClosings),
          profile.humorStyle, profile.formality, profile.questionFrequency,
          profile.hashtagStyle, profile.avgPostLength, JSON.stringify(profile.expertiseTopics),
          profile.includesCallToAction ? 1 : 0,
        ]
      );
    }

    return NextResponse.json({ profile, platform, source: "deepseek" });
  } catch (error) {
    console.error("Persona analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

// ── Local fallback analysis (runs without API key) ──

function localAnalyzeStyle(posts: string[]): StyleProfile {
  const text = posts.join(" ");
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  const emojiCount = (text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || []).length;
  const hashtagCount = (text.match(/#\w+/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const hasCTA = /check out|learn more|subscribe|follow|dm|comment below|link in/i.test(text);

  // Extract frequent 2-3 word phrases
  const phraseMap = new Map<string, number>();
  const tokens = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < tokens.length - 2; i++) {
    const phrase = tokens.slice(i, i + 3).join(" ");
    if (phrase.length > 10) {
      phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
    }
  }
  const commonPhrases = [...phraseMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([p]) => p);

  return {
    tone: "casual_professional",
    avgSentenceLength: Math.round(words.length / Math.max(sentences.length, 1)),
    usesEmoji: emojiCount > 0,
    emojiFrequency: emojiCount > posts.length * 2 ? "heavy" : emojiCount > posts.length ? "moderate" : "rare",
    commonPhrases,
    commonOpenings: [],
    commonClosings: [],
    humorStyle: "none",
    formality: 0.3,
    questionFrequency: Math.min(questionCount / Math.max(posts.length, 1), 1),
    hashtagStyle: hashtagCount > posts.length * 3 ? "heavy" : hashtagCount > posts.length ? "moderate" : "minimal",
    avgPostLength: Math.round(text.length / posts.length),
    expertiseTopics: [],
    includesCallToAction: hasCTA,
  };
}
