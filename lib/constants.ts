import type { SubscriptionPlan } from "@/types";

export const APP_NAME = "OPC SITIN";
export const APP_DESCRIPTION =
  "Your AI business partner. Clone your social persona, automate client acquisition on X & TikTok, and grow your one-person business.";

// ── Subscription Plans ──

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    features: [
      "1 platform (X or TikTok)",
      "30 AI-generated posts/month",
      "Basic analytics",
      "Persona cloning (1 profile)",
      "Email support",
    ],
    platformLimit: 1,
    contentLimit: 30,
    highlighted: false,
  },
  {
    tier: "pro",
    name: "Pro",
    price: 79,
    interval: "month",
    features: [
      "2 platforms (X + TikTok)",
      "100 AI-generated posts/month",
      "Advanced analytics",
      "Lead scoring & qualification",
      "3 persona profiles",
      "Priority support",
      "Content A/B testing",
    ],
    platformLimit: 2,
    contentLimit: 100,
    highlighted: true,
  },
  {
    tier: "business",
    name: "Business",
    price: 199,
    interval: "month",
    features: [
      "Unlimited platforms",
      "Unlimited AI-generated content",
      "Real-time analytics dashboard",
      "Advanced lead scoring",
      "Unlimited persona profiles",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    platformLimit: 999,
    contentLimit: 9999,
    highlighted: false,
  },
];

// ── Platform Limits (anti-detection) ──

export const PLATFORM_LIMITS = {
  x: {
    maxPostsPerDay: 5,
    maxRepliesPerDay: 50,
    maxDMsPerDay: 30,
    maxFollowsPerDay: 20,
    minIntervalMinutes: 60,
    maxPostLength: 280,
  },
  tiktok: {
    maxPostsPerDay: 2,
    maxRepliesPerDay: 20,
    maxDMsPerDay: 15,
    maxFollowsPerDay: 10,
    minIntervalMinutes: 360, // TikTok more aggressive on spam detection
    maxPostLength: 2200, // TikTok captions
  },
};

// ── Lead Scoring Rules ──

export const LEAD_SCORING = {
  strongSignal: {
    weight: 30,
    keywords: [
      "how much",
      "pricing",
      "hire",
      "interested",
      "book a call",
      "work together",
      "consulting",
      "let's talk",
      "proposal",
      "dms open",
      "collab",
      "partnership",
      "send me a dm",
    ],
  },
  mediumSignal: {
    weight: 15,
    keywords: [
      "question",
      "how do you",
      "what do you think",
      "curious",
      "tell me more",
      "interesting approach",
      "can you explain",
      "would love to know",
    ],
  },
  weakSignal: {
    weight: 5,
    keywords: [
      "great post",
      "thanks for sharing",
      "love this",
      "agree",
      "👏",
      "🔥",
      "💯",
      "this is fire",
      "keep going",
    ],
  },
};

// ── DeepSeek Config ──

export const AI_CONFIG = {
  model: "deepseek-chat", // DeepSeek V3
  baseUrl: "https://api.deepseek.com/v1",
  pricing: {
    inputPer1M: 0.27, // USD
    outputPer1M: 1.1, // USD
    estimatedMonthlyCost: (users: number, postsPerUser: number) => {
      // Rough estimate: ~2000 input + 500 output tokens per generated post
      const tokensPerPost = { input: 2000, output: 500 };
      const totalPosts = users * postsPerUser;
      const inputCost =
        (totalPosts * tokensPerPost.input) / 1_000_000 * 0.27;
      const outputCost =
        (totalPosts * tokensPerPost.output) / 1_000_000 * 1.1;
      return inputCost + outputCost;
    },
  },
};
