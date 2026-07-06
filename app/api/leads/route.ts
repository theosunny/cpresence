/**
 * GET  /api/leads → list scored leads
 * POST /api/leads → create a lead (when AI detects one)
 * PATCH /api/leads → mark as read/contacted
 */
import { NextRequest, NextResponse } from "next/server";
import { getDemoUserId, getAll, run } from "@/lib/db-sqlite";
import { scoreLead } from "@/lib/persona";

export async function GET() {
  const userId = getDemoUserId();
  const rows = getAll(
    `SELECT id, platform, platform_username as platformUsername, platform_avatar as platformAvatar,
            interaction_type as interactionType, interaction_content as interactionContent,
            score, level, signals, is_read as isRead, is_contacted as isContacted, created_at as createdAt
     FROM leads WHERE user_id = ? ORDER BY score DESC, created_at DESC LIMIT 50`,
    [userId]
  );
  // Parse JSON signals
  const leads = rows.map((r: any) => ({ ...r, signals: JSON.parse(r.signals || "[]") }));
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const userId = getDemoUserId();
  const { platform, platformUsername, interactionType, interactionContent, platformAvatar } = await req.json();

  const { score, level, signals } = scoreLead(interactionContent, interactionType);

  const result = run(
    `INSERT INTO leads (user_id, platform, platform_username, platform_avatar, interaction_type, interaction_content, score, level, signals)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, platform, platformUsername, platformAvatar || null, interactionType, interactionContent, score, level, JSON.stringify(signals)]
  );

  return NextResponse.json({
    id: String(result.lastInsertRowid),
    score,
    level,
    signals,
  });
}

export async function PATCH(req: NextRequest) {
  const userId = getDemoUserId();
  const { id, isRead, isContacted } = await req.json();

  if (isRead !== undefined) {
    run("UPDATE leads SET is_read = ? WHERE id = ? AND user_id = ?", [isRead ? 1 : 0, id, userId]);
  }
  if (isContacted !== undefined) {
    run("UPDATE leads SET is_contacted = ? WHERE id = ? AND user_id = ?", [isContacted ? 1 : 0, id, userId]);
  }

  return NextResponse.json({ success: true });
}
