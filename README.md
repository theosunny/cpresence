# OPC SITIN — Your AI Business Partner

> 一个人的 AI 商务伙伴。克隆你的社交人格，在 X 和 TikTok 上自动获客。

## 产品定位

**OPC SITIN** 是给一人公司 / 自由职业者 / 独立创作者的 AI 商务自动化工具。

你不是不会做销售——你是没时间同时做产品、做内容、做销售。OPC SITIN 帮你解决"没时间社交获客"的问题：

```
你的 X / TikTok 历史内容
        ↓
  AI 学习你的语气、风格、专业知识
        ↓
  AI 克隆体 24/7 自动运营：
  · 写帖子 · 回复评论 · 发私信 · 筛选潜在客户
        ↓
  高意向客户 → 推送给你 → 你只需要完成临门一脚
```

### 和 SITIN.ai 的关系

灵感来自周喆吾（Max Zhou）团队的 **SITIN.ai**——同一团队先做了 Presence（AR社交，$1000万融资），2024年转向 AI 商务自动化。我们用 DeepSeek + MySQL + X/TikTok 做一人版。

### 核心价值主张

| 痛点 | OPC SITIN 的解法 |
|------|-----------------|
| 没时间每天发帖 | AI 按你的风格自动生成内容，你审核通过才发 |
| 没精力回复每条评论/DM | AI 自动回复，高价值对话推送给你 |
| 分不清谁是潜在客户 | AI 自动评分筛选（关键词 + 行为 + 意图识别） |
| 内容创作瓶颈 | 输入一个主题 → AI 生成多条不同角度的帖子 |
| 记不住跟谁聊过什么 | 所有互动记录在 Dashboard，按优先级排列 |

### 目标用户

- **独立开发者 / indie hacker** — 在 X 上 build in public，用 AI 维护社区互动
- **自由职业者 / 顾问** — 在 X/TikTok 建立专业形象，自动获取咨询客户
- **内容创作者** — 在 TikTok 做 UGC，AI 帮你回复评论和筛选合作机会
- **一人公司** — 不想雇 SDR/运营，用 AI 替代

## 技术架构

```
┌──────────────────────────────────────────┐
│              用户浏览器                    │
│         Next.js 16 (React + Tailwind)      │
└────────────────┬─────────────────────────┘
                 │ API Routes
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│DeepSeek│ │  MySQL   │ │  Stripe  │
│  V3    │ │ (Prisma) │ │(Payments)│
└────────┘ └──────────┘ └──────────┘
    │
    ├──→ X API v2 (发帖/回复/DM)
    └──→ TikTok API v2 (视频/评论)
```

| 层 | 技术 |
|----|------|
| **前端** | Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| **AI** | DeepSeek V3 — $0.27/1M input tokens |
| **数据库** | MySQL + Prisma 7 |
| **支付** | Stripe (Checkout + Webhook) |
| **状态管理** | Zustand |
| **平台对接** | X API v2, TikTok API v2 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入：

```
DEEPSEEK_API_KEY=sk-...          # DeepSeek API key (必需)
DATABASE_URL=mysql://...         # MySQL 连接串（在 prisma.config.ts 里配置）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 初始化数据库

```bash
# 确保 MySQL 已运行，在 prisma.config.ts 里配置好 DATABASE_URL
npx prisma generate
npx prisma db push
```

### 4. 启动

```bash
npm run dev
# → http://localhost:3000
```

### 5. 可选：配置 X / TikTok / Stripe

```
# X (Twitter) API
X_CLIENT_ID=...
X_CLIENT_SECRET=...

# TikTok API
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...

# Stripe (支付)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

不配也能跑，Dashboard 用 mock 数据展示完整 UI。

## 项目结构

```
app/
├── page.tsx                  # Landing Page
├── layout.tsx                # 根布局
├── onboarding/page.tsx       # 平台连接引导流程
├── dashboard/
│   ├── layout.tsx            # 侧边栏 + 顶栏布局
│   └── page.tsx              # 主仪表盘
├── leads/page.tsx            # AI 筛选的潜在客户
├── content/page.tsx          # 内容审核队列
├── analytics/page.tsx        # 平台数据分析
├── settings/page.tsx         # Persona 配置 + 平台管理
├── billing/page.tsx          # 订阅管理
└── api/webhooks/stripe/      # Stripe 支付回调
lib/
├── deepseek.ts               # DeepSeek AI 客户端
├── persona.ts                # 核心引擎：风格分析 + 内容生成 + Lead 评分
├── x-api.ts                  # X (Twitter) API v2
├── tiktok-api.ts             # TikTok API v2
├── stripe.ts                 # Stripe 支付集成
├── db.ts                     # Prisma MySQL 客户端
├── utils.ts                  # cn() 工具
└── constants.ts              # 定价、平台限频、评分规则
```

## 用户使用流程

### 第一步：连接平台

1. 访问 `/onboarding`
2. 选择 X 或 TikTok
3. OAuth 授权 → 系统自动拉取你的历史内容

### 第二步：AI 学习

- DeepSeek 分析你的帖子风格、语气、常用词汇、专业领域
- 生成你的 **Persona 克隆**——写出来的东西像你本人

### 第三步：内容审核

- 每天 AI 自动生成帖子 → 进入 `/content` 审核队列
- 你可以：**批准**（定时发布）/ **编辑**（改完再发）/ **拒绝**（AI 重新生成）

### 第四步：客户筛选

- AI 自动回复评论和私信
- 识别高意向客户（关键词 + 行为分析）→ 进入 `/leads` 列表
- 按优先级排列，你只需要处理绿色标记的高分线索

### 第五步：看数据

- `/analytics` 看各平台增长趋势
- 粉丝增长、互动率、线索转化率一目了然

## 定价

| Plan | 价格 | 内容 |
|------|------|------|
| **Starter** | $29/月 | 1个平台, 30条内容/月, 基础分析 |
| **Pro** | $79/月 | 2个平台, 100条内容/月, Lead评分, A/B测试 |
| **Business** | $199/月 | 无限平台, 无限内容, API访问, 专属支持 |

MVP 阶段先在 X Build in Public 免费内测，验证 PMF 后再正式收费。

## MVP 状态

- [x] Landing page + onboarding 流程
- [x] Dashboard（KPI 卡片 + leads + 待审核内容）
- [x] Leads / Content / Analytics / Settings / Billing 页面（mock 数据）
- [x] DeepSeek 集成（Persona 引擎）
- [x] X API 客户端（发帖、拉取时间线、获取提及）
- [x] TikTok API 客户端（OAuth、视频上传、评论）
- [x] Stripe Checkout + Webhook
- [x] Prisma Schema（MySQL）
- [ ] X / TikTok OAuth 真实对接
- [ ] 去掉 mock 数据，接入 Prisma 查询
- [ ] Stripe 测试模式验证
- [ ] 部署到 Vercel
