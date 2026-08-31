"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const TIPS = [
  "Meet in public.",
  "Tell a friend.",
  "Do not send money.",
  "Leave if it feels wrong.",
];

export default function SafetyShortPage() {
  const router = useRouter();

  return (
    <AppShell title="Safety" onBack={() => router.push("/safety")}>
      <div className="space-y-2">
        {TIPS.map((tip) => (
          <div key={tip} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
            {tip}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
