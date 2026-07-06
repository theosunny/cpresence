"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Target,
} from "lucide-react";

// Mock data — replace with real data from Supabase
const STATS = [
  {
    label: "Leads This Month",
    value: "47",
    change: "+12%",
    up: true,
    icon: Users,
  },
  {
    label: "Content Published",
    value: "28",
    change: "+8%",
    up: true,
    icon: FileText,
  },
  {
    label: "Engagement Rate",
    value: "4.8%",
    change: "-0.3%",
    up: false,
    icon: TrendingUp,
  },
  {
    label: "Response Rate",
    value: "92%",
    change: "+5%",
    up: true,
    icon: MessageSquare,
  },
];

const RECENT_LEADS = [
  {
    id: "1",
    name: "Sarah Chen",
    platform: "x",
    score: 85,
    level: "high" as const,
    action: "DM: 'Love your thread on AI solopreneurship, would love to collab'",
    time: "2h ago",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    platform: "x",
    score: 62,
    level: "medium" as const,
    action: "Replied to your thread on AI automation",
    time: "5h ago",
  },
  {
    id: "3",
    name: "Emily Park",
    platform: "tiktok",
    score: 45,
    level: "medium" as const,
    action: "Commented: 'How do you do this??' on your latest video",
    time: "1d ago",
  },
  {
    id: "4",
    name: "David Kim",
    platform: "x",
    score: 91,
    level: "high" as const,
    action: "DM: 'Are you available for consulting? We need this at our company'",
    time: "1d ago",
  },
];

const PENDING_CONTENT = [
  {
    id: "1",
    platform: "x" as const,
    content: "The future of one-person businesses isn't about working harder...",
    scheduledFor: "Tomorrow 9:00 AM",
  },
  {
    id: "2",
    platform: "x" as const,
    content: "Just automated my entire client outreach pipeline with DeepSeek. Here's what happened 🧵",
    scheduledFor: "Tomorrow 2:00 PM",
  },
  {
    id: "3",
    platform: "tiktok" as const,
    content: "POV: You're a one-person business owner who just replaced their SDR with AI",
    scheduledFor: "Jul 9, 9:00 AM",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your AI business partner is active and growing your pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Active
          </Badge>
          <Link href="/content">
            <Button>Review Content</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.up ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>
                AI-qualified leads ready for your follow-up
              </CardDescription>
            </div>
            <Link href="/leads">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_LEADS.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        lead.level === "high"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.action}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {lead.platform}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Score: {lead.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {lead.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Content</CardTitle>
              <CardDescription>
                AI-generated posts awaiting your approval
              </CardDescription>
            </div>
            <Link href="/content">
              <Button variant="ghost" size="sm">
                Review all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PENDING_CONTENT.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px]">
                      {item.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.scheduledFor}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{item.content}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="default" className="h-7 text-xs">
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
