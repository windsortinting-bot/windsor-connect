"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const IDEAS = [
  "Saturday morning coffee in Walkerville.",
  "Sunday afternoon river walk. Keep it short.",
  "Friday patio, one drink, public place.",
];

export default function WindsorWeekendsPage() {
  const router = useRouter();

  return (
    <AppShell title="Weekend ideas" onBack={() => router.push("/windsor-spots")}>
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
