"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const LINKS = [
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/date-ideas", label: "Date ideas" },
  { href: "/first-date", label: "First date kit" },
  { href: "/safety-checkin", label: "Safety check-in" },
  { href: "/share", label: "Share / invite" },
  { href: "/muted", label: "Muted chats" },
  { href: "/weekly", label: "This week" },
  { href: "/ops-map", label: "Ops map" },
];

export default function CityMapPage() {
  const router = useRouter();

  return (
    <AppShell title="City map" onBack={() => router.push("/more")}>
      <p className="text-sm text-slate-600 mb-4">
        Windsor-specific tools. Core swipe and chat stay unchanged.
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