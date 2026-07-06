"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MessageSquare, ExternalLink, Mail } from "lucide-react";
import type { Lead, LeadScore } from "@/types";

const SCORE_COLORS: Record<LeadScore, string> = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("all");

  const fetchLeads = () => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads
    .filter((l) => {
      if (filter !== "all" && l.platform !== filter) return false;
      if (tab === "unread" && l.isRead) return false;
      if (tab === "contacted" && !l.isContacted) return false;
      if (search && !l.platformUsername.toLowerCase().includes(search.toLowerCase()) && !l.interactionContent.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const markRead = async (id: string) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    fetchLeads();
  };

  const markContacted = async (id: string) => {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isContacted: true }),
    });
    fetchLeads();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-muted-foreground">
          AI-qualified leads from X & TikTok. These are people showing buying intent.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="x">X / Twitter</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({leads.filter((l) => !l.isRead).length})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({leads.filter((l) => l.isContacted).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((lead) => (
            <Card key={lead.id} className={!lead.isRead ? "border-l-4 border-l-primary" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`mt-1.5 h-3 w-3 rounded-full ${SCORE_COLORS[lead.level]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{lead.platformUsername}</h3>
                        <Badge variant="outline" className="text-[10px]">{lead.platform}</Badge>
                        <Badge variant="secondary" className="text-[10px]">Score: {lead.score}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{lead.interactionContent}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {(lead.signals || []).map((signal: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{signal.description}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="default" className="gap-1" onClick={() => markContacted(lead.id)}>
                      <MessageSquare className="h-3 w-3" /> Reply
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => markRead(lead.id)}>
                      <ExternalLink className="h-3 w-3" /> View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No leads yet. Go through onboarding to start generating leads.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
