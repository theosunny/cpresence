// ── Core Data Types ──

export type Platform = "x" | "tiktok";

export type LeadScore = "high" | "medium" | "low";

export type ContentAction = "post" | "reply" | "dm" | "comment";

export type ContentStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export type SubscriptionTier = "starter" | "pro" | "business";

// ── Persona Types ──

export interface PersonaProfile {
  id: string;
  userId: string;
  platform: Platform;
  tone: string;
  avgSentenceLength: number;
  usesEmoji: boolean;
  commonPhrases: string[];
  humorStyle: string;
  formality: number; // 0-1
  questionFrequency: number; // 0-1
  hashtagStyle: "heavy" | "moderate" | "minimal";
  expertiseTopics: string[];
  samplePosts: string[];
  lastUpdated: string;
}

// ── Content Types ──

export interface ScheduledContent {
  id: string;
  userId: string;
  platform: Platform;
  action: ContentAction;
  content: string;
  aiGenerated: boolean;
  status: ContentStatus;
  scheduledAt: string;
  publishedAt?: string;
  retryCount: number;
  targetPostUrl?: string;
  targetUserId?: string;
}

// ── Lead Types ──

export interface Lead {
  id: string;
  userId: string;
  platform: Platform;
  platformUsername: string;
  platformAvatar?: string;
  interactionType: "comment" | "dm" | "like" | "follow" | "profile_view";
  interactionContent: string;
  score: number;
  level: LeadScore;
  signals: LeadSignal[];
  isRead: boolean;
  isContacted: boolean;
  createdAt: string;
}

export interface LeadSignal {
  type: "keyword" | "behavior" | "demographic";
  description: string;
  weight: number;
}

// ── Analytics Types ──

export interface PlatformStats {
  platform: Platform;
  followers: number;
  followersGrowth: number;
  postsThisMonth: number;
  engagementRate: number;
  impressions: number;
  clicks: number;
  leadsGenerated: number;
  leadsConverted: number;
  history: DataPoint[];
}

export interface DataPoint {
  date: string;
  value: number;
}

// ── User & Subscription Types ──

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: SubscriptionTier;
  connectedPlatforms: Platform[];
  createdAt: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  interval: "month";
  features: string[];
  platformLimit: number;
  contentLimit: number;
  highlighted: boolean;
}

// ── Onboarding Types ──

export type OnboardingStep =
  | "connect"
  | "importing"
  | "analyzing"
  | "training"
  | "ready";

export interface OnboardingState {
  step: OnboardingStep;
  platform: Platform | null;
  postsImported: number;
  analysisProgress: number;
}
