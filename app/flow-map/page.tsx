"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const FLOWS = [
  { href: "/start", label: "Smart start" },
  { href: "/go", label: "Account router" },
  { href: "/digest", label: "Daily counts" },
  { href: "/inbox-lite", label: "Lite inbox" },
  { href: "/active", label: "Activity stamp" },
  { href: "/admin/metrics", label: "Admin metrics" },
];

export default function FlowMapPage() {
  const router = useRouter();

  return (
    <AppShell title="Flow map" onBack={() => router.push("/more")}>
      <p className="text-sm text-slate-600 mb-6">
        New efficiency routes. Core swipe and chat stay as they are.
      </p>
      <div className="space-y-3">
        {FLOWS.map((f) => (
          <button
            key={f.href}
            type="button"
            onClick={() => router.push(f.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm text-left px-4"
          >
            {f.label}
          </button>
        ))}
      </div>
    </AppShell>
  );
}