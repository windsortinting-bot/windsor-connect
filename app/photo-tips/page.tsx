"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const TIPS = [
  "First photo: your face, daylight, no sunglasses.",
  "Second photo: full body, normal clothes.",
  "Third photo: you doing something in Windsor, not a group shot.",
];

export default function PhotoTipsPage() {
  const router = useRouter();

  return (
    <AppShell title="Photo tips" onBack={() => router.push("/profile")}>
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
