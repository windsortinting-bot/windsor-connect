"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WINDSOR_NEIGHBORHOODS } from "../../lib/neighborhoods";
import AppShell from "../components/AppShell";

export default function NeighborhoodsPage() {
  const router = useRouter();

  return (
    <AppShell title="Neighborhoods" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4">
        Windsor-first places used across profiles and date ideas.
      </p>
      <div className="space-y-2">
        {WINDSOR_NEIGHBORHOODS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => router.push(`/neighborhood/${encodeURIComponent(name)}`)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left"
          >
            {name}
          </button>
        ))}
      </div>
    </AppShell>
  );
}