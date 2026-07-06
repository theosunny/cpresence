"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MessageSquare,
  ExternalLink,
  Mail,
} from "lucide-react";
import type { Lead, LeadScore } from "@/types";

const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    userId: "u1",
    platform: "x",
    platformUsername: "Sarah Chen",
    interactionType: "dm",
    interactionContent:
      "Hey, saw your thread about AI automation for solopreneurs. Would love to chat about consulting rates — we need someone to help us set up our outreach pipeline.",
    score: 85,
    level: "high",
    signals: [
      { type: "keyword", description: 'Mentions "consulting rates"', weight: 30 },
      { type: "behavior", description: "Sent a DM on X", weight: 20 },
    ],
    isRead: false,
    isContacted: false,
    createdAt: "2026-07-06T14:00:00Z",
  },
  {
    id: "2",
    userId: "u1",
    platform: "x",
    platformUsername: "Marcus Johnson",
    interactionType: "comment",
    interactionContent:
      "This is exactly what I've been looking for. How do you handle the X API rate limits? Curious about your approach.",
    score: 62,
    level: "medium",
    signals: [
      { type: "keyword", description: "Asks specific technical question", weight: 15 },
    ],
    isRead: true,
    isContacted: false,
    createdAt: "2026-07-06T10:00:00Z",
  },
  {
    id: "3",
    userId: "u1",
    platform: "tiktok",
    platformUsername: "David Kim",
    interactionType: "dm",
    interactionContent:
      "Love your content! We should collaborate on a video. Are you available for a call next week to discuss a potential partnership?",
    score: 91,
    level: "high",
    signals: [
      { type: "keyword", description: 'Mentions "collaborate" + "call"', weight: 30 },
      { type: "behavior", description: "Direct message on TikTok", weight: 20 },
    ],
    isRead: false,
    isContacted: false,
    createdAt: "2026-07-06T08:00:00Z",
  },
];

const SCORE_COLORS: Record<LeadScore, string> = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
};

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-muted-foreground">
          AI-qualified leads from your social media. These are people showing
          buying intent.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="x">X / Twitter</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({leads.filter((l) => !l.isRead).length})
          </TabsTrigger>
          <TabsTrigger value="contacted">
            Contacted ({leads.filter((l) => l.isContacted).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lead List */}
      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} className={!lead.isRead ? "border-l-4 border-l-primary" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`mt-1.5 h-3 w-3 rounded-full ${SCORE_COLORS[lead.level]}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{lead.platformUsername}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {lead.platform}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        Score: {lead.score}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lead.interactionContent}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {lead.signals.map((signal, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {signal.description}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="default" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
