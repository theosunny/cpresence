"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Clock, Edit, Eye, Loader2, PenLine, Sparkles, X } from "lucide-react";
import type { ScheduledContent } from "@/types";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_review: <Clock className="h-4 w-4 text-yellow-500" />,
  approved: <Check className="h-4 w-4 text-green-500" />,
  published: <Eye className="h-4 w-4 text-blue-500" />,
  rejected: <X className="h-4 w-4 text-red-500" />,
};

export default function ContentPage() {
  const [content, setContent] = useState<ScheduledContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");

  const fetchContent = () => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContent(); }, []);

  const handleApprove = async (id: string) => {
    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    });
    fetchContent();
  };

  const handleReject = async (id: string) => {
    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "rejected" }),
    });
    fetchContent();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "x", topic: topic || "building an AI business" }),
      });
      setTopic("");
      fetchContent();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const pending = content.filter((c) => c.status === "pending_review");
  const approved = content.filter((c) => c.status === "approved");
  const published = content.filter((c) => c.status === "published");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Queue</h1>
          <p className="text-muted-foreground">
            Review and approve AI-generated content before it goes live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Topic (e.g. 'AI for freelancers')..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-56"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <Button className="gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({published.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {content.length === 0 && (
            <div className="text-center py-12">
              <PenLine className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-2">No content yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a topic above and click Generate to create your first AI post.
              </p>
              <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate My First Post
              </Button>
            </div>
          )}
          {content.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">{item.platform}</Badge>
                    <Badge variant="outline" className="gap-1">{item.action}</Badge>
                    <Badge variant="secondary" className="gap-1">
                      {STATUS_ICONS[item.status]}
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {item.scheduledAt
                      ? new Date(item.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })
                      : "Not scheduled"}
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</p>
                </div>

                {item.targetPostUrl && (
                  <p className="mt-2 text-xs text-muted-foreground">Replying to: {item.targetPostUrl}</p>
                )}

                {item.status === "pending_review" && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => handleApprove(item.id)}>
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="h-3 w-3" /> Edit & Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => handleReject(item.id)}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
