/**
 * POST /api/content/generate
 *
 * Generate AI content (post/reply/DM) using the user's persona.
 * Stores generated content in SQLite with status "pending_review".
 */
import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/deepseek";
import { getDemoUserId, getOne, run } from "@/lib/db-sqlite";

export async function POST(req: NextRequest) {
  try {
    const { platform, topic, action = "post", replyTo, dmContext } = await req.json();
    const userId = getDemoUserId();

    // Load persona
    const persona = getOne<{
      id: string; tone: string; uses_emoji: number; emoji_frequency: string;
      formality: number; question_frequency: number; hashtag_style: string;
      expertise_topics: string; common_phrases: string; common_openings: string;
      common_closings: string; includes_cta: number;
    }>(
      "SELECT * FROM personas WHERE user_id = ? AND platform = ? AND is_active = 1",
      [userId, platform]
    );

    const topics = persona ? JSON.parse(persona.expertise_topics || "[]") : [];
    const phrases = persona ? JSON.parse(persona.common_phrases || "[]") : [];

    // Build system prompt
    const systemPrompt = persona
      ? `You write social media posts on behalf of a business professional.
Tone: ${persona.tone}. Formality: ${persona.formality < 0.3 ? "Casual" : "Semi-formal"}.
${persona.uses_emoji ? `Use emojis ${persona.emoji_frequency}ly.` : "No emojis."}
${topics.length > 0 ? `Write ONLY about: ${topics.join(", ")}.` : ""}
${phrases.length > 0 ? `Common phrases to use: ${phrases.join(", ")}.` : ""}
${persona.includes_cta ? "Include a call-to-action when appropriate." : "Avoid calls-to-action."}
Platform: ${platform === "x" ? "X/Twitter" : "TikTok"}.
${platform === "x" ? "Max 280 characters." : "Max 2200 characters, more casual tone."}
Write in first person. Sound authentic, not like generic AI content.`
      : `You are a creative social media writer. Platform: ${platform === "x" ? "X/Twitter (max 280 chars)" : "TikTok (max 2200 chars)"}. Sound authentic.`;

    // Build user prompt
    let userPrompt = "";
    if (action === "reply" && replyTo) {
      userPrompt = `Write a reply to this comment: "${replyTo}". Be ${dmContext || "helpful"} and authentic.`;
    } else if (action === "dm" && dmContext) {
      userPrompt = `Write a DM to ${replyTo || "someone"} about: ${dmContext}. Goal: introduction. Build rapport first.`;
    } else {
      userPrompt = `Write a ${platform} post about: "${topic || 'general business insight related to my expertise'}". Make it engaging and valuable.`;
    }

    let content: string;
    try {
      content = await chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0.85, maxTokens: platform === "x" ? 400 : 800 }
      );
    } catch {
      // DeepSeek fallback — generate locally
      content = generateLocalContent(platform, topic, action);
    }

    // Schedule for tomorrow 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    // Store in DB
    const result = run(
      `INSERT INTO contents (user_id, persona_id, platform, action, content, ai_generated, status, scheduled_at)
       VALUES (?, ?, ?, ?, ?, 1, 'pending_review', ?)`,
      [userId, persona?.id || null, platform, action, content, tomorrow.toISOString()]
    );

    return NextResponse.json({
      id: String(result.lastInsertRowid),
      content,
      platform,
      action,
      scheduledAt: tomorrow.toISOString(),
      status: "pending_review",
    });
  } catch (error) {
    console.error("Content generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

function generateLocalContent(platform: string, topic: string, action: string): string {
  const templates = {
    x: [
      `Just shipped a major update to my ${topic || "project"}. Here's what I learned 🧵`,
      `Unpopular opinion: ${topic || "the best tools"} don't matter as much as consistency.`,
      `3 things I wish I knew before starting my ${topic || "one-person business"}:`,
    ],
    tiktok: [
      `POV: You just automated your entire client pipeline with AI 🤖 ${topic || ""}`,
      `The #1 mistake most creators make with ${topic || "their content"} 👀`,
      `Day 30 of building in public. Here's the honest update 📊 ${topic || ""}`,
    ],
  };

  const pool = templates[platform as keyof typeof templates] || templates.x;
  return pool[Math.floor(Math.random() * pool.length)];
}
