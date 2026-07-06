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

编辑 `.env.local`，只需一行即可启动：

```
DEEPSEEK_API_KEY=sk-...   # DeepSeek API key（必需，用于 AI 生成）
```

不配 Key 也能跑——AI 使用本地回退分析引擎。

可选配置（功能增强）：

```
NEXT_PUBLIC_APP_URL=http://localhost:3000   # 默认值，部署后改为公网域名
X_CLIENT_ID=...          # X OAuth（一键连接）
X_CLIENT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...   # Stripe 收款
```

### 3. 启动

```bash
npm run dev
# → http://localhost:3000
```

**不需要装 MySQL。** SQLite 自动创建 `prisma/opc-sitin.db`，零配置。

### 4. 体验完整流程

1. 打开 http://localhost:3000/onboarding
2. 选 X / Twitter → 预填了样本帖子 → 点 **Analyze & Build Persona**
3. DeepSeek 分析你的写作风格 → 展示 AI 人格画像 + 生成的样帖
4. 点 **Go to Dashboard** → 看到 Leads + 待审核内容
5. 去 `/content` → 输入 topic → 点 **Generate** → AI 写新帖子 → **Approve**
6. 去 `/settings` → 管理平台连接

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
3. 粘贴你的历史帖子（已预填样本数据）
4. DeepSeek 分析你的写作风格

> 💡 OAuth 一键连接已在 Settings 页面实现。需要 X Developer App 凭据才能启用。

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

### ✅ 已完成

| 模块 | 状态 | 说明 |
|------|------|------|
| Landing + Onboarding | ✅ | 用户粘贴帖子 → DeepSeek 分析风格 → 生成 AI 人格画像 |
| Dashboard | ✅ | KPI 卡片 + Leads 列表 + 内容审核队列，数据来自 SQLite |
| Leads 管理 | ✅ | AI 评分筛选，按优先级排列，可标记已读/已联系 |
| Content 审核 | ✅ | 输入 topic → DeepSeek 生成 → 审批/拒绝 → 持久化 |
| Settings | ✅ | 平台连接管理、手动 token 输入、Persona 配置 |
| DeepSeek V3 集成 | ✅ | Persona 分析 + 内容生成 + 本地回退（无 Key 也能跑） |
| SQLite 持久化 | ✅ | users、personas、contents、leads、analytics、platform_tokens |
| X/TikTok API 封装 | ✅ | lib/x-api.ts + lib/tiktok-api.ts 全部写完 |
| X OAuth 2.0 PKCE | ✅ | 代码完整，等 X Developer App 创建即可用 |
| Stripe Checkout + Webhook | ✅ | 代码完整，等 Stripe 测试 Key 即可验证 |
| 全页面共享 Sidebar | ✅ | (app) route group 统一布局 |

### 🔴 TODO — 产品可用

| 优先级 | 任务 | 工作量 | 阻塞项 |
|--------|------|--------|--------|
| 🔴 P0 | **创建 X Developer App** | 5 分钟 | 需要验证 X 账号（绑手机号） |
| 🔴 P0 | **配置 X_CLIENT_ID / SECRET** | 1 分钟 | 等上面完成 |
| 🔴 P0 | **部署到 Vercel** | 10 分钟 | 需要 Vercel 账号 + GitHub 连接 |
| 🔴 P0 | **配置公网 Callback URL** | 1 分钟 | 部署后拿到域名才能配 |

### 🟡 TODO — 产品完善

| 优先级 | 任务 | 工作量 | 说明 |
|--------|------|--------|------|
| 🟡 P1 | **TikTok OAuth** | 2-3 小时 | 需要 TikTok 审核通过 App |
| 🟡 P1 | **定时内容调度** | 4-6 小时 | 用 cron/queue 每天自动生成 + 定时发帖 |
| 🟡 P1 | **Stripe 测试验证** | 1 小时 | 在 Stripe Dashboard 创建测试产品 + Key |
| 🟡 P1 | **X 真实发帖接通** | 30 分钟 | OAuth 配好即通 |
| 🟡 P1 | **Analytics 接入真实数据** | 3-4 小时 | 从 X/TikTok API 拉粉丝数、互动量 |
| 🟡 P2 | **用户注册/登录** | 4-6 小时 | 目前是 demo 用户，需要 Clerk/NextAuth |
| 🟡 P2 | **多用户支持** | 4-6 小时 | 用户隔离、配额管理 |
| 🟡 P2 | **MySQL 迁移** | 2 小时 | 从 SQLite 切到 MySQL/PlanetScale |
| 🟡 P2 | **TikTok 视频生成** | 8-12 小时 | 文字→视频（AI 生成）+ TikTok 上传 |

### 🟢 TODO — 商业化

| 优先级 | 任务 | 工作量 | 说明 |
|--------|------|--------|------|
| 🟢 P3 | **Build in Public 启动** | 持续 | X 账号发开发进度，积累初始用户 |
| 🟢 P3 | **Stripe 正式收款** | 2-3 小时 | 配置正式产品/价格，连接 Stripe 生产环境 |
| 🟢 P3 | **用户文档/帮助中心** | 4-6 小时 | 使用指南、FAQ、视频教程 |

---

## 部署

### 部署到 Vercel（免费）

```bash
# 1. 安装 Vercel CLI（一次性）
npm i -g vercel

# 2. 登录（绑定 GitHub 账号）
vercel login

# 3. 部署（在项目根目录）
vercel
# 按提示操作 → 自动检测 Next.js → 几分钟后拿到公网 URL

# 4. 部署到生产环境
vercel --prod
```

也可以直接在 [vercel.com/new](https://vercel.com/new/clone?repository-url=https://github.com/theosunny/cpresence) 通过 GitHub 一键导入。

### 部署后配置

去 Vercel Dashboard → 你的项目 → Settings → Environment Variables，添加：

```
DEEPSEEK_API_KEY=sk-...                        # 生产环境 Key
NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app  # 公网地址
```

如果配了 X OAuth（可选），回到 [developer.x.com](https://developer.x.com) 把 Callback URL 更新为：
```
https://你的域名.vercel.app/api/auth/x
```

### 平台 API 注册地址

| 平台 | 用途 | 注册链接 |
|------|------|---------|
| X (Twitter) | AI 自动发帖 | https://developer.x.com |
| TikTok | AI 发视频 | https://developers.tiktok.com |
| Stripe | 收款 | https://dashboard.stripe.com |

> 💡 不配平台 API 也能用：AI 生成内容 → 你手动复制发到社交媒体。OAuth 只是让这个步骤全自动。

---

## 常见问题

### 需要装数据库吗？
**不需要。** SQLite 自动创建 `prisma/opc-sitin.db`。部署到 Vercel 后如需持久化，切到 PlanetScale/MySQL（Vercel Serverless 会重置文件系统）。

### 不配 DeepSeek Key 能用吗？
**能。** AI 回退到本地分析引擎（词频、句式统计），效果不如 DeepSeek 但功能完整。

### 用户需要创建自己的 X App 吗？
**不需要。** 你（产品方）创建一个 X App，配好 `X_CLIENT_ID`，所有用户通过一键 OAuth 连接。跟 Typefully、Buffer、Hootsuite 一样。

### Approve 后会自动发到 X 吗？
**会。** Settings 里连接好 X → Content 里点 Approve → 调用 `postTweet()` 发帖。代码已就绪，等 `X_CLIENT_ID` 配好即可。
