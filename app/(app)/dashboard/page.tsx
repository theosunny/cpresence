"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

interface DashboardData {
  leadsThisMonth: number;
  leadsChange: string;
  contentPublished: number;
  contentChange: string;
  engagementRate: string;
  engagementChange: string;
  responseRate: string;
  responseChange: string;
  recentLeads: Array<{
    id: string;
    platform: string;
    platformUsername: string;
    action: string;
    score: number;
    level: string;
    createdAt: string;
  }>;
  pendingContent: Array<{
    id: string;
    platform: string;
    content: string;
    scheduledAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATS = data
    ? [
        { label: "Leads This Month", value: String(data.leadsThisMonth), change: data.leadsChange, up: true, icon: Users },
        { label: "Content Published", value: String(data.contentPublished), change: data.contentChange, up: true, icon: FileText },
        { label: "Engagement Rate", value: data.engagementRate, change: data.engagementChange, up: false, icon: TrendingUp },
        { label: "Response Rate", value: data.responseRate, change: data.responseChange, up: true, icon: MessageSquare },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

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
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentLeads?.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        lead.level === "high" ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-sm">{lead.platformUsername}</p>
                      <p className="text-xs text-muted-foreground">{lead.action}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{lead.platform}</Badge>
                        <span className="text-[10px] text-muted-foreground">Score: {lead.score}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
              {(!data?.recentLeads || data.recentLeads.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No leads yet — connect a platform to get started.
                </p>
              )}
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
              <Button variant="ghost" size="sm">Review all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.pendingContent?.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px]">{item.platform}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      }) : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{item.content}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={async () => {
                        await fetch("/api/content", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: item.id, status: "approved" }),
                        });
                        window.location.reload();
                      }}
                    >
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
                      onClick={async () => {
                        await fetch("/api/content", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: item.id, status: "rejected" }),
                        });
                        window.location.reload();
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              {(!data?.pendingContent || data.pendingContent.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending content.{" "}
                  <Link href="/onboarding" className="text-primary hover:underline">
                    Generate some →
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
