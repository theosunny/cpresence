/**
 * GET  /api/platform → list connected platforms + status
 * POST /api/platform → save platform token (after OAuth)
 * DELETE /api/platform → disconnect platform
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoUserId, getAll, getOne, run } from "@/lib/db-sqlite";

export async function GET() {
  const userId = getDemoUserId();
  const tokens = getAll(
    `SELECT platform, platform_username as username, platform_user_id as userId,
            created_at as connectedAt
     FROM platform_tokens WHERE user_id = ?`,
    [userId]
  );

  // Also count content per platform
  const xContent = getOne<{ c: number }>(
    "SELECT COUNT(*) as c FROM contents WHERE user_id = ? AND platform = 'x'",
    [userId]
  );
  const tkContent = getOne<{ c: number }>(
    "SELECT COUNT(*) as c FROM contents WHERE user_id = ? AND platform = 'tiktok'",
    [userId]
  );

  return NextResponse.json({
    platforms: [
      {
        platform: "x",
        name: "X / Twitter",
        connected: !!tokens.find((t: any) => t.platform === "x"),
        username: tokens.find((t: any) => t.platform === "x")?.username || null,
        contentCount: xContent?.c || 0,
      },
      {
        platform: "tiktok",
        name: "TikTok",
        connected: !!tokens.find((t: any) => t.platform === "tiktok"),
        username: tokens.find((t: any) => t.platform === "tiktok")?.username || null,
        contentCount: tkContent?.c || 0,
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  const userId = getDemoUserId();
  const { platform, accessToken, refreshToken, platformUserId, platformUsername } = await req.json();

  run(
    `INSERT INTO platform_tokens (user_id, platform, access_token, refresh_token, platform_user_id, platform_username)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, platform) DO UPDATE SET
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       platform_user_id = excluded.platform_user_id,
       platform_username = excluded.platform_username,
       updated_at = datetime('now')`,
    [userId, platform, accessToken, refreshToken || null, platformUserId || null, platformUsername || null]
  );

  return NextResponse.json({ success: true, platform });
}

export async function DELETE(req: NextRequest) {
  const userId = getDemoUserId();
  const { platform } = await req.json();

  run(
    "DELETE FROM platform_tokens WHERE user_id = ? AND platform = ?",
    [userId, platform]
  );

  return NextResponse.json({ success: true });
}
