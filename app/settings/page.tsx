"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Globe, Save, Trash2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your AI persona and platform connections.
        </p>
      </div>

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Platforms where your AI partner is active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium">X / Twitter</p>
                <p className="text-sm text-muted-foreground">
                  Connected since Jul 2026 · 2,840 followers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] text-green-600">
                Active
              </Badge>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            + Connect Another Platform
          </Button>
        </CardContent>
      </Card>

      {/* Persona Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Configuration</CardTitle>
          <CardDescription>
            Fine-tune how your AI partner writes and engages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tone">Tone</Label>
            <Select defaultValue="casual_professional">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual_professional">Casual Professional</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
                <SelectItem value="warm">Warm & Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Post Frequency</Label>
            <Select defaultValue="1-2">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 posts per day</SelectItem>
                <SelectItem value="3-5">3-5 posts per day</SelectItem>
                <SelectItem value="5-7">5-7 posts per week</SelectItem>
                <SelectItem value="2-3">2-3 posts per week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Use Emojis</p>
              <p className="text-xs text-muted-foreground">
                Let AI decide when to include emojis
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Auto-approve Replies</p>
              <p className="text-xs text-muted-foreground">
                Skip review for simple replies to comments
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="topics">Expertise Topics</Label>
            <Input
              id="topics"
              defaultValue="AI automation, solopreneurship, B2B sales, personal branding, no-code"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated topics. AI will only write about these areas.
            </p>
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
