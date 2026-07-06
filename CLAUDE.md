# OPC SITIN — AI Business Partner for Solopreneurs

Clone of SITIN.ai: an AI-powered social media automation tool that clones your persona and acquires clients on autopilot.

## Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (14 components)
- **AI:** DeepSeek V3 ($0.27/1M input tokens)
- **Database:** MySQL + Prisma 7
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
npm run dev      # Start dev server on :3000
npm run build    # Production build
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push    # Push schema to MySQL
```

## Environment Variables (.env.local)
```
DEEPSEEK_API_KEY=sk-...         # DeepSeek API key
DATABASE_URL=mysql://...        # MySQL connection (in prisma.config.ts)
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...
X_CLIENT_ID=...                 # Twitter API OAuth
X_CLIENT_SECRET=...
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
```

## Key Decisions
- **DeepSeek over Claude/GPT:** $0.27/1M tokens makes MVP affordable for solo dev
- **MySQL over Supabase:** User preference, Prisma 7 as ORM
- **X + TikTok over LinkedIn:** Better fit for Build-in-Public + indie hacker audience
- **Stripe over LemonSqueezy:** More control, lower fees, full subscription management
- **Web app over mobile:** Faster to ship, easier to iterate, mobile app later if needed

## MVP Status
- [x] Landing page + onboarding flow
- [x] Dashboard with mock data
- [x] Leads, Content, Analytics, Settings, Billing pages
- [x] DeepSeek integration (persona engine)
- [x] X API client (post, fetch timeline, mentions)
- [x] TikTok API client (OAuth, video upload, comments)
- [x] Stripe checkout + webhook
- [x] Prisma schema (MySQL)
- [ ] Real OAuth flow (X + TikTok)
- [ ] Remove mock data, wire up Prisma queries
- [ ] Payment testing with Stripe test mode
- [ ] Deploy to Vercel
