"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  AtSign,
  Music2,
  Check,
  ArrowRight,
  Loader2,
  PartyPopper,
  ClipboardPaste,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type Step = "platform" | "paste" | "analyzing" | "ready";

const SAMPLE_POSTS_X = `The most underrated skill for indie hackers: knowing when to stop building and start shipping.

I spent 3 months perfecting my SaaS before launching. Got 0 users. Rebuilt the MVP in 2 weeks, launched on X, got 50 beta users in 3 days.

Ship fast, iterate faster.

Just hit $5K MRR with my AI tool for freelancers. Here's the exact playbook I used:

1. Built in public on X (grew from 0 → 2K followers)
2. Gave away free value for 60 days straight
3. Launched with a $29 lifetime deal (sold 47 copies)
4. Converted LTD users to monthly ($29 → $79/mo)

The "secret" is there's no secret. Just show up every day.

Unpopular opinion: most "productivity tools" make you LESS productive.

Notion, Obsidian, Roam — they're fun to set up, but they're procrastination in disguise. I shipped more in 3 months with a .txt file than in 2 years with a "perfect system."

Best tool is the one you actually use.`.split("\n\n").filter(Boolean);

const SAMPLE_POSTS_TIKTOK = `Day 1 of building in public 🚀 I quit my 9-5 to build an AI tool for creators. Follow along to see if I make it or go broke. #buildinpublic #indiehacker

POV: You just made your first $100 online and realize you can do this from anywhere 😭🌴 #digitalnomad #freelance

The #1 mistake I see new creators make: trying to be perfect. Just post. Your first 100 videos will suck. That's the point. #creatoradvice #tiktoktips

3 tools every solopreneur needs in 2026:
- AI writing assistant
- Automated client outreach
- Good project management

Save this for later 📌 #solopreneur #businessowner`.split("\n\n").filter(Boolean);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState("");
  const [progress, setProgress] = useState(0);
  const [personaProfile, setPersonaProfile] = useState<any>(null);
  const [generatedSample, setGeneratedSample] = useState("");
  const [error, setError] = useState("");

  const handlePlatformSelect = () => {
    if (!selectedPlatform) return;
    // Pre-fill with sample posts for demo experience
    const samples = selectedPlatform === "x" ? SAMPLE_POSTS_X : SAMPLE_POSTS_TIKTOK;
    setUserPosts(samples.join("\n\n---\n\n"));
    setStep("paste");
  };

  const handleAnalyze = async () => {
    if (!userPosts.trim()) return;
    setStep("analyzing");
    setError("");

    try {
      const posts = userPosts
        .split(/---|\n\n\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 20);

      if (posts.length < 2) {
        setError("Please provide at least 2 posts for better analysis.");
        setStep("paste");
        return;
      }

      // Phase 1: Analyze style
      setProgress(25);
      const analyzeRes = await fetch("/api/persona/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts, platform: selectedPlatform }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const analyzeData = await analyzeRes.json();
      setPersonaProfile(analyzeData.profile);

      // Phase 2: Generate sample content
      setProgress(70);
      const generateRes = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          topic: analyzeData.profile.expertiseTopics?.[0] || "my expertise",
          action: "post",
        }),
      });

      if (!generateRes.ok) throw new Error("Generation failed");
      const generateData = await generateRes.json();
      setGeneratedSample(generateData.content);

      setProgress(100);
      setTimeout(() => setStep("ready"), 800);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep("paste");
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>OPC SITIN</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step 1: Platform Selection */}
          {step === "platform" && (
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Platform</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose where your AI partner will help you engage.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "x",
                    name: "X / Twitter",
                    desc: "Best for indie hackers, builders, creators — build in public",
                    icon: AtSign,
                  },
                  {
                    id: "tiktok",
                    name: "TikTok",
                    desc: "Best for viral content, UGC growth, broad audience reach",
                    icon: Music2,
                  },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                      selectedPlatform === platform.id
                        ? "border-primary ring-2 ring-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <platform.icon className="h-8 w-8" />
                    <div className="flex-1">
                      <p className="font-medium">{platform.name}</p>
                      <p className="text-sm text-muted-foreground">{platform.desc}</p>
                    </div>
                    {selectedPlatform === platform.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={!selectedPlatform}
                  onClick={handlePlatformSelect}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Paste Content */}
          {step === "paste" && (
            <Card>
              <CardHeader>
                <CardTitle>Paste Your Posts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll analyze your writing style. Paste your recent{" "}
                  {selectedPlatform === "x" ? "X posts" : "TikTok captions"} below.
                  We pre-filled sample content for you to test.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userPosts}
                  onChange={(e) => setUserPosts(e.target.value)}
                  placeholder={
                    selectedPlatform === "x"
                      ? "Paste your X/Twitter posts here (separate with --- or blank lines)..."
                      : "Paste your TikTok captions here..."
                  }
                  className="min-h-[250px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Paste 5-20 posts for best results. Separate posts with "---" or blank lines.
                </p>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-2"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={!userPosts.trim()}
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze & Build Persona
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep("platform")}
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Analyzing */}
          {step === "analyzing" && (
            <Card>
              <CardContent className="pt-6 space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Building Your AI Persona</h2>
                  <p className="text-muted-foreground mt-2">
                    DeepSeek is analyzing your writing style, tone, and expertise...
                  </p>
                </div>
                <div className="space-y-2 text-left text-sm bg-muted rounded-lg p-4 max-w-md mx-auto">
                  <p className="flex items-center gap-2">
                    {progress >= 25 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Analyzing {selectedPlatform === "x" ? "X" : "TikTok"} posts
                  </p>
                  <p className="flex items-center gap-2">
                    {progress >= 50 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Loader2 className={`h-4 w-4 ${progress >= 25 ? "animate-spin" : ""}`} />
                    )}
                    Extracting style profile
                  </p>
                  <p className="flex items-center gap-2">
                    {progress >= 80 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Loader2 className={`h-4 w-4 ${progress >= 50 ? "animate-spin" : ""}`} />
                    )}
                    Generating sample content
                  </p>
                  <p className="flex items-center gap-2">
                    {progress >= 100 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Loader2 className={`h-4 w-4 ${progress >= 80 ? "animate-spin" : ""}`} />
                    )}
                    Saving persona profile
                  </p>
                </div>
                <Progress value={progress} className="h-2 max-w-md mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {progress < 100 ? "AI processing..." : "Done!"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Ready */}
          {step === "ready" && (
            <Card>
              <CardContent className="pt-6 space-y-6 text-center">
                <PartyPopper className="mx-auto h-16 w-16 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Your AI Partner is Ready!</h2>
                  <p className="text-muted-foreground mt-2">
                    We&apos;ve analyzed your style and built your{" "}
                    {selectedPlatform === "x" ? "X" : "TikTok"} persona.
                  </p>
                </div>

                {/* Persona Profile Summary */}
                {personaProfile && (
                  <div className="rounded-lg border p-4 text-left space-y-3">
                    <p className="text-sm font-semibold">🎯 Your AI Persona Profile:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tone:</span>{" "}
                        <span className="font-medium">{personaProfile.tone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Formality:</span>{" "}
                        <span className="font-medium">
                          {personaProfile.formality < 0.3 ? "Casual" : personaProfile.formality < 0.6 ? "Balanced" : "Formal"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Emoji style:</span>{" "}
                        <span className="font-medium">{personaProfile.emojiFrequency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg post:</span>{" "}
                        <span className="font-medium">{personaProfile.avgPostLength} chars</span>
                      </div>
                    </div>
                    {personaProfile.expertiseTopics?.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Topics:</span>{" "}
                        {personaProfile.expertiseTopics.slice(0, 5).map((t: string, i: number) => (
                          <span key={i} className="inline-block bg-secondary rounded px-1.5 py-0.5 text-xs mr-1 mb-1">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sample Generated Content */}
                {generatedSample && (
                  <div className="rounded-lg bg-muted p-4 text-left">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      📝 AI-generated sample post:
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{generatedSample}</p>
                  </div>
                )}

                <div className="rounded-lg border p-4 text-left space-y-2">
                  <p className="text-sm font-medium">What happens next:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />Your persona generates daily content
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />Posts go to your review queue first
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />You approve before anything goes live
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />Leads appear in your dashboard
                    </li>
                  </ul>
                </div>

                <Button size="lg" className="w-full gap-2" onClick={handleGoToDashboard}>
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
