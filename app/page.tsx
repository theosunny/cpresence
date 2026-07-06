import Link from "next/link";
import { ArrowRight, Sparkles, Zap, MessageSquare, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS, APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/onboarding">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          Built for Solopreneurs
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl">
          Your AI Business{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Partner
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {APP_DESCRIPTION}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" size="lg">
              See How It Works
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>10x your client pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>AI writes like you</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <span>Save 20+ hours/week</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-24">
        <h2 className="text-center text-3xl font-bold">How It Works</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Four steps to your AI business partner
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {[
            {
              step: "1",
              title: "Connect",
              desc: "Link your LinkedIn or Twitter. We import your posts and conversations.",
            },
            {
              step: "2",
              title: "Clone",
              desc: "AI analyzes your writing style, tone, and expertise to build your persona.",
            },
            {
              step: "3",
              title: "Automate",
              desc: "Your AI partner posts, replies, and engages — sounding just like you.",
            },
            {
              step: "4",
              title: "Convert",
              desc: "Qualified leads land in your dashboard. You focus on closing deals.",
            },
          ].map((item) => (
            <Card key={item.step}>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Start free. Upgrade when you&apos;re ready.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={
                plan.highlighted
                  ? "border-primary ring-2 ring-primary"
                  : ""
              }
            >
              <CardContent className="pt-6">
                {plan.highlighted && (
                  <Badge className="mb-2">Most Popular</Badge>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding">
                  <Button
                    className="mt-6 w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Built for one-person businesses. © 2026 {APP_NAME}.</p>
      </footer>
    </div>
  );
}
