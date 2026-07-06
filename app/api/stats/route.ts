/**
 * GET /api/stats → dashboard summary stats
 */
import { NextResponse } from "next/server";
import { getDemoUserId, getOne, getAll, run } from "@/lib/db-sqlite";

export async function GET() {
  const userId = getDemoUserId();

  // Seed demo data if empty
  const leadCount = (getOne<{ c: number }>("SELECT COUNT(*) as c FROM leads WHERE user_id = ?", [userId]))?.c || 0;
  if (leadCount === 0) {
    seedDemoData(userId);
  }

  const contentCount = (getOne<{ c: number }>("SELECT COUNT(*) as c FROM contents WHERE user_id = ?", [userId]))?.c || 0;
  const leadCount2 = (getOne<{ c: number }>("SELECT COUNT(*) as c FROM leads WHERE user_id = ?", [userId]))?.c || 0;
  const approvedCount = (getOne<{ c: number }>("SELECT COUNT(*) as c FROM contents WHERE user_id = ? AND status = 'published'", [userId]))?.c || 0;
  const highLeads = (getOne<{ c: number }>("SELECT COUNT(*) as c FROM leads WHERE user_id = ? AND level = 'high'", [userId]))?.c || 0;

  return NextResponse.json({
    leadsThisMonth: leadCount2,
    leadsChange: "+12%",
    contentPublished: approvedCount,
    contentChange: "+8%",
    engagementRate: "4.8%",
    engagementChange: "-0.3%",
    responseRate: "92%",
    responseChange: "+5%",
    recentLeads: getAll(
      `SELECT id, platform, platform_username as platformUsername, interaction_content as action, score, level, created_at as createdAt
       FROM leads WHERE user_id = ? ORDER BY score DESC LIMIT 4`,
      [userId]
    ),
    pendingContent: getAll(
      `SELECT id, platform, content, scheduled_at as scheduledAt
       FROM contents WHERE user_id = ? AND status = 'pending_review' ORDER BY scheduled_at ASC LIMIT 3`,
      [userId]
    ),
  });
}

function seedDemoData(userId: string) {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString();
  const hoursAgo = (h: number) => fmt(new Date(now.getTime() - h * 3600000));

  const leads = [
    ["x", "Sarah Chen", "dm", "Hey, saw your thread about AI automation. Would love to chat about consulting rates — we need help setting up our pipeline.", 85, "high", JSON.stringify([
      { type: "keyword", description: "Mentions \"consulting rates\"", weight: 30 },
      { type: "behavior", description: "Sent a DM on X", weight: 20 }
    ]), 0, 0, hoursAgo(2)],
    ["x", "Marcus Johnson", "comment", "This is exactly what I've been looking for. How do you handle the X API rate limits? Curious.", 62, "medium", JSON.stringify([
      { type: "keyword", description: "Asks specific technical question", weight: 15 }
    ]), 1, 0, hoursAgo(5)],
    ["tiktok", "Emily Park", "comment", "How do you do this?? I need this for my business", 45, "medium", JSON.stringify([
      { type: "keyword", description: "Shows buying intent", weight: 15 }
    ]), 1, 0, hoursAgo(24)],
    ["x", "David Kim", "dm", "Love your work! Are you available for a consulting call? We need to automate our entire social presence.", 91, "high", JSON.stringify([
      { type: "keyword", description: "Mentions \"consulting\" + \"call\"", weight: 30 },
      { type: "behavior", description: "DM on X", weight: 20 }
    ]), 0, 0, hoursAgo(28)],
  ];

  for (const l of leads) {
    run(
      `INSERT INTO leads (user_id, platform, platform_username, interaction_type, interaction_content, score, level, signals, is_read, is_contacted, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [userId, ...l]
    );
  }

  const tomorrow9am = new Date(now);
  tomorrow9am.setDate(tomorrow9am.getDate() + 1);
  tomorrow9am.setHours(9, 0, 0, 0);
  const tomorrow2pm = new Date(tomorrow9am);
  tomorrow2pm.setHours(14, 0, 0, 0);

  const contents = [
    ["x", "post", "The future of one-person businesses isn't about working harder — it's about working smarter with AI. Here's what I've learned after 6 months:\n\n1. Your personal brand IS your moat\n2. Consistency beats virality\n3. AI amplifies you — it doesn't replace you\n\nWhat's your biggest challenge as a solopreneur?", fmt(tomorrow9am)],
    ["x", "post", "Just automated my entire client outreach pipeline. Here's what happened:\n\n• Response rate: 12% → 34%\n• Time spent: 20hrs/week → 2hrs/week\n• Pipeline value: +$15K this month", fmt(tomorrow2pm)],
    ["tiktok", "post", "POV: You're a one-person business owner who just replaced their SDR with AI 🤖\n\n#solopreneur #AItools #businessgrowth", fmt(new Date(now.getTime() + 2 * 86400000))],
  ];

  for (const c of contents) {
    run(
      `INSERT INTO contents (user_id, platform, action, content, ai_generated, status, scheduled_at)
       VALUES (?, ?, ?, ?, 1, 'pending_review', ?)`,
      [userId, ...c]
    );
  }

  // Seed persona
  run(
    `INSERT OR IGNORE INTO personas (user_id, platform, tone, expertise_topics, common_phrases)
     VALUES (?, 'x', 'casual_professional', '["AI automation","solopreneurship","B2B sales","personal branding","building in public"]', '["Here is the thing","The secret","Let me tell you"]')`,
    [userId]
  );
}
