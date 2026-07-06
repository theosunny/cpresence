"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AtSign, Music2, Save, Trash2, Loader2, Check, AlertCircle, ExternalLink,
} from "lucide-react";

interface PlatformStatus {
  platform: string;
  name: string;
  connected: boolean;
  username: string | null;
  contentCount: number;
}

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDemoInput, setShowDemoInput] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPlatforms = useCallback(() => {
    fetch("/api/platform").then((r) => r.json()).then((d) => {
      setPlatforms(d.platforms);
      setLoading(false);
    });
  }, []);

  useEffect(() => { fetchPlatforms(); }, [fetchPlatforms]);

  // Handle OAuth redirect results
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "x_connected") {
      setToast({ type: "success", message: "X connected! Your AI can now post to your account." });
      fetchPlatforms();
      // Clean URL
      window.history.replaceState({}, "", "/settings");
    } else if (error) {
      const messages: Record<string, string> = {
        x_declined: "You declined the X authorization.",
        x_state_mismatch: "Security check failed. Please try again.",
        x_token_failed: "Failed to get access token from X. Check your X App credentials.",
        x_missing_config: "X App not configured. Add X_CLIENT_ID to your environment.",
        x_oauth_error: "X OAuth error. Please try again.",
      };
      setToast({ type: "error", message: messages[error] || error });
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams, fetchPlatforms]);

  // Clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleXLogin = () => {
    setActionLoading("x");
    window.location.href = "/api/auth/x?action=login";
  };

  const handleDisconnect = async (platform: string) => {
    setActionLoading(platform);
    await fetch("/api/platform", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    setActionLoading(null);
    fetchPlatforms();
    setToast({ type: "success", message: `${platform === "x" ? "X" : "TikTok"} disconnected.` });
  };

  const handleDemoToken = async (platform: string) => {
    const token = tokenInput.trim();
    if (!token) return;
    setActionLoading(platform);
    await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        accessToken: token,
        platformUsername: platform === "x" ? "@your-handle" : "@your-tiktok",
      }),
    });
    setTokenInput("");
    setShowDemoInput(null);
    setActionLoading(null);
    fetchPlatforms();
    setToast({ type: "success", message: "Token saved. Approve content to publish." });
  };

  const platformIcons: Record<string, React.ReactNode> = {
    x: <AtSign className="h-6 w-6" />,
    tiktok: <Music2 className="h-6 w-6" />,
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your AI persona and platform connections.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${
          toast.type === "success"
            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
            : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        }`}>
          {toast.type === "success" ? (
            <Check className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Connect X or TikTok. When you approve AI content, it publishes to these platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            [1, 2].map((i) => <Skeleton key={i} className="h-24" />)
          ) : (
            platforms.map((p) => (
              <div key={p.platform} className="rounded-lg border p-4">
                {p.connected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">{platformIcons[p.platform]}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{p.name}</p>
                          <Badge variant="secondary" className="text-[10px] text-green-600 gap-1">
                            <Check className="h-3 w-3" />Connected
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {p.username || "Your account"} · {p.contentCount} posts
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost" size="sm" className="text-destructive"
                      onClick={() => handleDisconnect(p.platform)}
                      disabled={actionLoading === p.platform}
                    >
                      {actionLoading === p.platform ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3">
                      {platformIcons[p.platform]}
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.platform === "x"
                            ? "Your AI posts to X. Free tier: 500 posts/month."
                            : "Your AI posts to TikTok. Requires video content."}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={handleXLogin}
                            disabled={actionLoading === p.platform}
                          >
                            {actionLoading === p.platform ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : null}
                            Connect {p.name}
                          </Button>

                          <Button
                            size="sm" variant="ghost"
                            className="text-xs text-muted-foreground"
                            onClick={() => setShowDemoInput(showDemoInput === p.platform ? null : p.platform)}
                          >
                            Or paste token
                          </Button>
                        </div>

                        {showDemoInput === p.platform && (
                          <div className="mt-3 border-t pt-3 space-y-2">
                            <Label className="text-xs">Manual token (testing only):</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder={p.platform === "x" ? "X Bearer Token..." : "TikTok access_token..."}
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                className="flex-1"
                              />
                              <Button size="sm" onClick={() => handleDemoToken(p.platform)} disabled={!tokenInput.trim()}>
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Persona Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Configuration</CardTitle>
          <CardDescription>Fine-tune how your AI writes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tone">Writing Tone</Label>
            <select id="tone" defaultValue="casual_professional"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="casual_professional">Casual Professional</option>
              <option value="formal">Formal</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="analytical">Analytical</option>
              <option value="warm">Warm & Friendly</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Post Frequency</Label>
            <select id="frequency" defaultValue="1-2"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="1-2">1-2 posts per day</option>
              <option value="3-5">3-5 posts per day</option>
              <option value="5-7">5-7 posts per week</option>
              <option value="2-3">2-3 posts per week</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Auto-approve Replies</p>
              <p className="text-xs text-muted-foreground">Skip review for simple replies</p>
            </div>
            <Switch />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topics">Expertise Topics</Label>
            <Input id="topics"
              defaultValue="AI, solopreneurship, indie hacking, building in public, SaaS" />
            <p className="text-xs text-muted-foreground">Comma-separated. AI only writes about these.</p>
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap in Suspense boundary for useSearchParams
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 max-w-2xl" />}>
      <SettingsPageInner />
    </Suspense>
  );
}
