/**
 * GET  /api/content → list content queue
 * PATCH /api/content → approve/reject content
 *
 * When approving: if platform tokens exist, actually posts to X/TikTok.
 * Falls back to "published" status in DB even without real tokens (for demo).
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoUserId, getAll, getOne, run } from "@/lib/db-sqlite";
import { postTweet } from "@/lib/x-api";
import { initializeTikTokUpload, publishTikTokVideo } from "@/lib/tiktok-api";

export async function GET() {
  const userId = getDemoUserId();
  const rows = getAll(
    `SELECT id, platform, action, content, ai_generated as aiGenerated, status,
            scheduled_at as scheduledAt, published_at as publishedAt, target_post_url as targetPostUrl,
            created_at as createdAt
     FROM contents WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const userId = getDemoUserId();

  if (status === "approved") {
    // Get the content
    const item = getOne<{ content: string; platform: string; action: string; target_post_url?: string }>(
      "SELECT content, platform, action, target_post_url FROM contents WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!item) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Try to get platform tokens
    const tokens = getOne<{ access_token: string; refresh_token?: string; platform_user_id?: string }>(
      "SELECT access_token, refresh_token, platform_user_id FROM platform_tokens WHERE user_id = ? AND platform = ?",
      [userId, item.platform]
    );

    let publishResult: { success: boolean; platformPostId?: string; error?: string } = { success: false };

    if (tokens) {
      try {
        if (item.platform === "x") {
          const tweet = await postTweet(
            { accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
            item.content,
            item.target_post_url
              ? { replyToTweetId: item.target_post_url }
              : undefined
          );
          publishResult = { success: true, platformPostId: tweet.id };
        } else if (item.platform === "tiktok") {
          // TikTok requires video. For text-only posts, we log and skip.
          // In production: generate a video from the text using AI, then upload.
          publishResult = { success: false, error: "TikTok requires video content. Text-only posts cannot be published." };
        }
      } catch (err: any) {
        publishResult = { success: false, error: err.message || "Platform API error" };
      }
    } else {
      // No tokens — mark as "published" in demo mode
      publishResult = { success: true };
    }

    if (publishResult.success) {
      run(
        `UPDATE contents SET status = 'published', published_at = datetime('now') WHERE id = ? AND user_id = ?`,
        [id, userId]
      );

      // Seed a lead from this post (simulate engagement)
      const username = tokens?.platform_user_id || "audience";
      run(
        `INSERT INTO leads (user_id, platform, platform_username, interaction_type, interaction_content, score, level, signals, is_read, is_contacted)
         VALUES (?, ?, ?, 'comment', ?, ?, ?, ?, 0, 0)`,
        [
          userId,
          item.platform,
          username === "audience" ? "New Follower" : `@${username}`,
          `Engaged with your post: "${item.content.slice(0, 80)}..."`,
          25,
          "low",
          JSON.stringify([{ type: "behavior", description: "Engaged with your content", weight: 5 }]),
        ]
      );

      return NextResponse.json({
        success: true,
        published: true,
        platformPostId: publishResult.platformPostId,
        source: tokens ? "real" : "demo",
      });
    } else {
      // Publish failed — mark as failed so user can retry
      run(
        `UPDATE contents SET status = 'failed', retry_count = retry_count + 1 WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      return NextResponse.json({
        success: false,
        error: publishResult.error,
        retry: true,
      }, { status: 500 });
    }
  } else if (status === "rejected") {
    run(
      `UPDATE contents SET status = 'rejected' WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
