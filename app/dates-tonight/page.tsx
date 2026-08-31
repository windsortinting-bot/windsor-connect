"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const IDEAS = [
  "Coffee at a busy Walkerville spot. Daylight. Easy to leave.",
  "Short walk by the river, then decide if you want food.",
  "Downtown patio for one drink only. Public place.",
];

export default function DatesTonightPage() {
  const router = useRouter();

  return (
    <AppShell title="Simple date ideas" onBack={() => router.push("/first-date")}>
      <div className="space-y-2">
        {IDEAS.map((idea) => (
          <div key={idea} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
            {idea}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
