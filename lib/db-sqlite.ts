/**
 * SQLite persistence layer — zero config, local file.
 *
 * Uses better-sqlite3 (synchronous, fast, no server needed).
 * DB file: prisma/opc-sitin.db (gitignored)
 *
 * This replaces mock data. When you set up MySQL later,
 * swap lib/db.ts (Prisma) back in.
 */

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prisma", "opc-sitin.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ──

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    tier TEXT DEFAULT 'starter',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS personas (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    platform TEXT NOT NULL CHECK(platform IN ('x','tiktok')),
    tone TEXT DEFAULT 'casual_professional',
    avg_sentence_length INTEGER DEFAULT 18,
    uses_emoji INTEGER DEFAULT 1,
    emoji_frequency TEXT DEFAULT 'moderate',
    common_phrases TEXT DEFAULT '[]',
    common_openings TEXT DEFAULT '[]',
    common_closings TEXT DEFAULT '[]',
    humor_style TEXT DEFAULT 'none',
    formality REAL DEFAULT 0.3,
    question_frequency REAL DEFAULT 0.2,
    hashtag_style TEXT DEFAULT 'minimal',
    avg_post_length INTEGER DEFAULT 500,
    expertise_topics TEXT DEFAULT '[]',
    includes_cta INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, platform)
  );

  CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    persona_id TEXT REFERENCES personas(id),
    platform TEXT NOT NULL,
    action TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_generated INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending_review',
    scheduled_at TEXT,
    published_at TEXT,
    target_post_url TEXT,
    target_user_id TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    platform TEXT NOT NULL,
    platform_username TEXT NOT NULL,
    platform_avatar TEXT,
    interaction_type TEXT NOT NULL,
    interaction_content TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    level TEXT DEFAULT 'low',
    signals TEXT DEFAULT '[]',
    is_read INTEGER DEFAULT 0,
    is_contacted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    platform TEXT NOT NULL,
    date TEXT NOT NULL,
    followers INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    UNIQUE(user_id, platform, date)
  );

  CREATE TABLE IF NOT EXISTS platform_tokens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    platform TEXT NOT NULL CHECK(platform IN ('x','tiktok')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    platform_user_id TEXT,
    platform_username TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, platform)
  );
`);

// ── Seed demo user ──

const seedDemo = db.prepare(`SELECT id FROM users WHERE email = 'demo@opcsitin.com'`).get() as { id: string } | undefined;

if (!seedDemo) {
  const userId = db.prepare(`INSERT INTO users (email, name, tier) VALUES (?, ?, ?)`).run(
    "demo@opcsitin.com", "Demo User", "pro"
  ).lastInsertRowid;
  console.log(`[DB] Seeded demo user: ${userId}`);
}

export default db;

// ── Typed query helpers ──

export function getOne<T>(sql: string, params: unknown[] = []): T | undefined {
  return db.prepare(sql).get(params) as T | undefined;
}

export function getAll<T>(sql: string, params: unknown[] = []): T[] {
  return db.prepare(sql).all(params) as T[];
}

export function run(sql: string, params: unknown[] = []): { lastInsertRowid: number | bigint; changes: number } {
  return db.prepare(sql).run(params);
}

export function getDemoUserId(): string {
  const row = getOne<{ id: string }>("SELECT id FROM users WHERE email = 'demo@opcsitin.com'");
  if (!row) throw new Error("Demo user not found");
  return row.id;
}
