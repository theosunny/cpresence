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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Step = "platform" | "importing" | "analyzing" | "ready";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleConnect = () => {
    if (!selectedPlatform) return;
    setStep("importing");
    // Simulate import process
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setStep("analyzing");
        // Simulate analysis
        setTimeout(() => {
          setStep("ready");
        }, 2000);
      }
      setProgress(Math.min(p, 100));
    }, 500);
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
      <main className="container mx-auto flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* Step: Platform Selection */}
          {step === "platform" && (
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Platform</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose where your AI partner will help you engage.
                  Start with one platform — you can add more later.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "x",
                    name: "X / Twitter",
                    desc: "Best for indie hackers, builders, creators — build in public",
                    icon: AtSign,
                    comingSoon: false,
                  },
                  {
                    id: "tiktok",
                    name: "TikTok",
                    desc: "Best for viral content, UGC growth, broad audience reach",
                    icon: Music2,
                    comingSoon: false,
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
                      <p className="text-sm text-muted-foreground">
                        {platform.desc}
                      </p>
                    </div>
                    {selectedPlatform === platform.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                    {platform.comingSoon && (
                      <span className="text-xs text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </button>
                ))}

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={!selectedPlatform}
                  onClick={handleConnect}
                >
                  Connect & Start <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <Card>
              <CardContent className="pt-6 space-y-6 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Importing Your Content</h2>
                  <p className="text-muted-foreground mt-2">
                    Fetching your recent posts from {selectedPlatform}...
                  </p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step: Analyzing */}
          {step === "analyzing" && (
            <Card>
              <CardContent className="pt-6 space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Building Your Persona</h2>
                  <p className="text-muted-foreground mt-2">
                    Our AI is analyzing your writing style, tone, and
                    expertise...
                  </p>
                </div>
                <div className="space-y-2 text-left text-sm bg-muted rounded-lg p-4">
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Style profile extracted
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Key topics identified
                  </p>
                  <p className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fine-tuning persona model...
                  </p>
                </div>
                <Progress value={75} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Step: Ready */}
          {step === "ready" && (
            <Card>
              <CardContent className="pt-6 space-y-6 text-center">
                <PartyPopper className="mx-auto h-16 w-16 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">
                    Your AI Partner is Ready!
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    We&apos;ve cloned your writing style and built your persona.
                    Your AI partner is ready to start engaging on{" "}
                    {selectedPlatform === "x" ? "X" : "TikTok"}.
                  </p>
                </div>

                <div className="rounded-lg border p-4 text-left space-y-2">
                  <p className="text-sm font-medium">
                    Here&apos;s what happens next:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      Your persona starts generating content daily
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      All posts go to your review queue first
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      You approve or edit before anything goes live
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      Leads appear in your dashboard automatically
                    </li>
                  </ul>
                </div>

                <Button size="lg" className="w-full" onClick={handleGoToDashboard}>
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
