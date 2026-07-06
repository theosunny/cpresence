"use client";

import { create } from "zustand";
import type { UserProfile, OnboardingState } from "@/types";

interface AppStore {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Onboarding
  onboarding: OnboardingState;
  setOnboarding: (state: Partial<OnboardingState>) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Selected platform filter
  selectedPlatform: string | null;
  setSelectedPlatform: (p: string | null) => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  onboarding: {
    step: "connect",
    platform: null,
    postsImported: 0,
    analysisProgress: 0,
  },
  setOnboarding: (state) =>
    set((s) => ({ onboarding: { ...s.onboarding, ...state } })),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  selectedPlatform: null,
  setSelectedPlatform: (p) => set({ selectedPlatform: p }),
}));

// ── Persona Store ──

import type { PersonaProfile } from "@/types";

interface PersonaStore {
  profiles: PersonaProfile[];
  activeProfile: PersonaProfile | null;
  setProfiles: (profiles: PersonaProfile[]) => void;
  setActiveProfile: (profile: PersonaProfile | null) => void;
}

export const usePersonaStore = create<PersonaStore>((set) => ({
  profiles: [],
  activeProfile: null,
  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (profile) => set({ activeProfile: profile }),
}));

// ── Content Store ──

import type { ScheduledContent } from "@/types";

interface ContentStore {
  queue: ScheduledContent[];
  setQueue: (queue: ScheduledContent[]) => void;
  approveItem: (id: string) => void;
  rejectItem: (id: string) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  queue: [],
  setQueue: (queue) => set({ queue }),
  approveItem: (id) =>
    set((s) => ({
      queue: s.queue.map((item) =>
        item.id === id ? { ...item, status: "approved" as const } : item
      ),
    })),
  rejectItem: (id) =>
    set((s) => ({
      queue: s.queue.map((item) =>
        item.id === id ? { ...item, status: "rejected" as const } : item
      ),
    })),
}));

// ── Leads Store ──

import type { Lead } from "@/types";

interface LeadsStore {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  markRead: (id: string) => void;
  markContacted: (id: string) => void;
}

export const useLeadsStore = create<LeadsStore>((set) => ({
  leads: [],
  setLeads: (leads) => set({ leads }),
  markRead: (id) =>
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...l, isRead: true } : l)),
    })),
  markContacted: (id) =>
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id ? { ...l, isContacted: true } : l
      ),
    })),
}));
