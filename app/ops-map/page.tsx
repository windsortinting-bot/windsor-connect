"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const LINKS = [
  { href: "/welcome-back", label: "Welcome back" },
  { href: "/openers", label: "Conversation openers" },
  { href: "/photo-check", label: "Photo check" },
  { href: "/discover-preview", label: "Discover preview" },
  { href: "/match-quality", label: "Match strength" },
  { href: "/admin/duplicates", label: "Admin: duplicate matches" },
  { href: "/admin/funnel", label: "Admin: funnel" },
  { href: "/admin/launch", label: "Admin: launch checklist" },
];

export default function OpsMapPage() {
  const router = useRouter();

  return (
    <AppShell title="Ops map" onBack={() => router.push("/flow-map")}>
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