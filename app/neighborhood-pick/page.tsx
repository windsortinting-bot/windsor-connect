"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WINDSOR_NEIGHBORHOODS } from "../../lib/neighborhoods";
import AppShell from "../components/AppShell";

export default function NeighborhoodPickPage() {
  const router = useRouter();

  return (
    <AppShell title="Neighborhoods" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4">These are the areas used in the app.</p>
      <div className="space-y-2">
        {WINDSOR_NEIGHBORHOODS.map((name) => (
          <div key={name} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm">
            {name}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
