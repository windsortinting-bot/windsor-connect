"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WINDSOR_SPOTS } from "../../lib/windsorSpots";
import AppShell from "../components/AppShell";

export default function WindsorSpotsPage() {
  const router = useRouter();

  return (
    <AppShell title="Windsor spots" onBack={() => router.push("/dates-tonight")}>
      <div className="space-y-2">
        {WINDSOR_SPOTS.map((spot) => (
          <div key={spot.name} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="font-semibold">{spot.name}</p>
            <p className="text-sm text-slate-600 mt-1">{spot.tip}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
