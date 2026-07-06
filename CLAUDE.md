# OPC SITIN — AI Business Partner for Solopreneurs

Clone of SITIN.ai: an AI-powered social media automation tool that clones your persona and acquires clients on autopilot.

## Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (15 components)
- **AI:** DeepSeek V3 ($0.27/1M input tokens)
- **Database:** SQLite (better-sqlite3) — zero config, auto-created. MySQL schema ready for later migration.
- **Payments:** Stripe (Checkout + Webhooks)
- **State:** Zustand
- **Platform APIs:** X (Twitter) API v2, TikTok API v2

## Project Structure
```
app/
├── page.tsx              # Landing page
├── onboarding/           # Platform connect → import → analyze → ready
├── dashboard/            # Main dashboard (KPI cards, leads, content queue)
├── leads/                # AI-qualified leads list
├── content/              # Content review queue
├── analytics/            # Platform analytics + charts
├── settings/             # Persona config + platform connections
├── billing/              # Subscription management
└── api/webhooks/stripe/  # Stripe webhook handler
lib/
├── deepseek.ts           # DeepSeek client (chat, chatStream, chatJSON)
├── persona.ts            # AI persona engine (style analysis, post gen, lead scoring)
├── x-api.ts              # X/Twitter API v2 client
├── tiktok-api.ts         # TikTok API client
├── stripe.ts             # Stripe checkout + portal
├── db.ts                 # Prisma MySQL client
└── constants.ts          # Pricing, platform limits, lead scoring rules
```

## Commands
```bash
npm run dev      # Start dev server on :3000 (SQLite auto-created)
npm run build    # Production build
npx vercel       # Deploy to Vercel
npx vercel --prod # Deploy to production
```

## Environment Variables (.env.local)
```bash
# Required
DEEPSEEK_API_KEY=sk-...          # DeepSeek V3 API key

# Optional — X OAuth (one-click connect for users)
X_CLIENT_ID=...                  # from developer.x.com → OAuth 2.0
X_CLIENT_SECRET=...

# Optional — Stripe payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...

# Optional — TikTok
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Decisions
- **DeepSeek over Claude/GPT:** $0.27/1M tokens makes MVP affordable for solo dev
- **SQLite over MySQL for MVP:** Zero config, auto-created, swap to MySQL/PlanetScale later
- **X + TikTok over LinkedIn:** Better fit for Build-in-Public + indie hacker audience
- **Stripe over LemonSqueezy:** More control, lower fees, full subscription management
- **Web app over mobile:** Faster to ship, easier to iterate, mobile app later if needed

## MVP Status

### Done
- [x] Landing + onboarding (paste posts → DeepSeek analyzes style → shows persona profile)
- [x] Dashboard (KPI cards + leads + content queue from SQLite)
- [x] Leads page (AI-scored, filterable, mark read/contacted)
- [x] Content page (generate via DeepSeek, approve/reject, real persistence)
- [x] Analytics (static, needs real platform data)
- [x] Settings (connect/disconnect platforms, manual token input, persona config)
- [x] Billing (static pricing, Stripe checkout code ready)
- [x] DeepSeek V3 integration (persona engine, content gen, local fallback)
- [x] X API v2 client (postTweet, fetchTimeline, getUser)
- [x] TikTok API v2 client (OAuth, video upload, publish)
- [x] X OAuth 2.0 PKCE flow (complete, needs X App credentials)
- [x] Stripe Checkout + Webhook handler
- [x] SQLite persistence (6 tables, typed helpers)
- [x] All pages share Sidebar+Header via (app) route group
- [x] Content approve → auto-publish to connected platforms (code ready)

### TODO — Blockers
- [ ] **Create X Developer App** — developer.x.com, needs X account verification (phone)
- [ ] **Deploy to Vercel** — needs Vercel account + GitHub connection
- [ ] **Configure X_CLIENT_ID / SECRET** — after X App created

### TODO — Next
- [ ] TikTok OAuth (needs TikTok App approval)
- [ ] Real X posting (code ready, blocked on OAuth)
- [ ] Automated daily content scheduling (cron/Vercel Cron Jobs)
- [ ] Stripe test mode verification
- [ ] Real analytics from X/TikTok API
- [ ] User auth (Clerk/NextAuth) — currently single demo user
- [ ] Multi-user support (user isolation, quotas)
- [ ] MySQL migration (swap SQLite for MySQL/PlanetScale)
- [ ] TikTok video generation (AI text-to-video)
- [ ] Stripe production mode
