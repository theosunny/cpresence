"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { Check } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are on the <strong>Starter</strong> plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Starter</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                $29/month · Billed monthly · Next invoice: Aug 1, 2026
              </p>
            </div>
            <Button variant="outline">Cancel Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>
            More platforms, more content, more leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-lg border p-4 ${
                  plan.highlighted ? "border-primary ring-2 ring-primary" : ""
                }`}
              >
                {plan.highlighted && (
                  <Badge className="mb-2">Most Popular</Badge>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  disabled={plan.tier === "starter"}
                >
                  {plan.tier === "starter" ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
