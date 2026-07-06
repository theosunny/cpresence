"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Eye, MousePointerClick, Target } from "lucide-react";
import type { PlatformStats } from "@/types";

const MOCK_STATS: PlatformStats[] = [
  {
    platform: "x",
    followers: 2840,
    followersGrowth: 8.3,
    postsThisMonth: 18,
    engagementRate: 5.2,
    impressions: 12400,
    clicks: 890,
    leadsGenerated: 34,
    leadsConverted: 5,
    history: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, "0")}`,
      value: Math.floor(Math.random() * 500) + 200,
    })),
  },
];

export default function AnalyticsPage() {
  const stats = MOCK_STATS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your AI partner&apos;s performance across platforms.
        </p>
      </div>

      <Tabs defaultValue="linkedin">
        <TabsList>
          <TabsTrigger value="x">X / Twitter</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Followers",
            value: stats.followers.toLocaleString(),
            change: `+${stats.followersGrowth}%`,
            icon: Users,
          },
          {
            label: "Impressions",
            value: stats.impressions.toLocaleString(),
            change: "+12%",
            icon: Eye,
          },
          {
            label: "Engagement Rate",
            value: `${stats.engagementRate}%`,
            change: "+0.8%",
            icon: TrendingUp,
          },
          {
            label: "Clicks",
            value: stats.clicks.toLocaleString(),
            change: "+15%",
            icon: MousePointerClick,
          },
          {
            label: "Leads Generated",
            value: stats.leadsGenerated.toString(),
            change: "+22%",
            icon: Target,
          },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <kpi.icon className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <Badge variant="secondary" className="mt-1 text-[10px] text-green-600">
                {kpi.change}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end gap-1">
            {stats.history.slice(-14).map((point, i) => {
              const height = (point.value / Math.max(...stats.history.map((p) => p.value))) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
                    {point.value}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>14 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
