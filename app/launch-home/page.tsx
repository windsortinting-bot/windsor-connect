"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const LINKS = [
  { href: "/self-preview", label: "See how you look" },
  { href: "/bio-help", label: "Improve bio" },
  { href: "/intent", label: "Set dating intent" },
  { href: "/windsor-check", label: "Confirm you are local" },
  { href: "/events", label: "City events" },
  { href: "/ready-tonight", label: "Ready tonight?" },
  { href: "/quiet-hours", label: "Quiet hours" },
  { href: "/export-data", label: "Export my data" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/city-map", label: "City map" },
];

export default function LaunchHomePage() {
  const router = useRouter();

  return (
    <AppShell title="Launch home" onBack={() => router.push("/more")}>
      <p className="text-sm text-slate-600 mb-4">
        Soft-launch tools. Swipe and chat stay where they are.
      </p>
      <div className="space-y-3">
        {LINKS.map((l) => (
          <button
            key={l.href}
            type="button"
            onClick={() => router.push(l.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {l.label}
          </button>
        ))}
      </div>
    </AppShell>
  );
}