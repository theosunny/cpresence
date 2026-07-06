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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Check,
  Clock,
  Edit,
  Eye,
  PenLine,
  ThumbsUp,
  X,
} from "lucide-react";
import type { ScheduledContent } from "@/types";

const MOCK_CONTENT: ScheduledContent[] = [
  {
    id: "1",
    userId: "u1",
    platform: "x",
    action: "post",
    content:
      "The future of one-person businesses isn't about working harder — it's about working smarter with AI. Here's what I've learned after 6 months of building an AI business partner:\n\n1. Your personal brand IS your moat\n2. Consistency beats virality\n3. AI doesn't replace you — it amplifies you\n\nWhat's your biggest challenge as a solopreneur?",
    aiGenerated: true,
    status: "pending_review",
    scheduledAt: "2026-07-08T09:00:00Z",
    retryCount: 0,
  },
  {
    id: "2",
    userId: "u1",
    platform: "x",
    action: "post",
    content:
      "Just automated my entire client outreach pipeline with DeepSeek. Here's what happened:\n\n• Response rate: 12% → 34%\n• Time spent: 20hrs/week → 2hrs/week\n• Pipeline value: +$15K this month\n\nThe secret? An AI that writes exactly like me. 🧵",
    aiGenerated: true,
    status: "pending_review",
    scheduledAt: "2026-07-08T14:00:00Z",
    retryCount: 0,
  },
  {
    id: "3",
    userId: "u1",
    platform: "x",
    action: "reply",
    content:
      "Great question! In my experience, starting small and iterating based on feedback is the way to go. Happy to jump on a call and share more details.",
    aiGenerated: true,
    status: "pending_review",
    scheduledAt: "2026-07-07T16:00:00Z",
    retryCount: 0,
    targetPostUrl: "https://x.com/sarahchen/status/123",
  },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_review: <Clock className="h-4 w-4 text-yellow-500" />,
  approved: <Check className="h-4 w-4 text-green-500" />,
  published: <Eye className="h-4 w-4 text-blue-500" />,
  rejected: <X className="h-4 w-4 text-red-500" />,
};

export default function ContentPage() {
  const [content] = useState<ScheduledContent[]>(MOCK_CONTENT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Queue</h1>
          <p className="text-muted-foreground">
            Review and approve AI-generated content before it goes live.
          </p>
        </div>
        <Button className="gap-2">
          <PenLine className="h-4 w-4" />
          Generate New Post
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({content.filter((c) => c.status === "pending_review").length})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {content.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1">
                    {item.platform}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {item.action}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    {STATUS_ICONS[item.status]}
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.scheduledAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </div>

              {item.targetPostUrl && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Replying to: {item.targetPostUrl}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <Button size="sm" className="gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Edit className="h-3 w-3" />
                  Edit & Approve
                </Button>
                <Button size="sm" variant="ghost" className="gap-1 text-destructive">
                  <X className="h-3 w-3" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
