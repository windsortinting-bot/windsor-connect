"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const FAQS = [
  {
    q: "Is this only for Windsor?",
    a: "Yes. Soft launch is city-first: Walkerville, Riverside, Downtown, Ford City, South Windsor, and campus.",
  },
  {
    q: "Do I need to pay?",
    a: "Not for the current soft launch. Core swipe, match, and chat are free.",
  },
  {
    q: "What if someone makes me uncomfortable?",
    a: "Use Block and Report, then leave the chat. You can also pause your account.",
  },
  {
    q: "Why did a match disappear?",
    a: "Unmatch, block, or a duplicate cleanup can remove it. Start from swipe again if needed.",
  },
];

export default function FaqPage() {
  const router = useRouter();

  return (
    <AppShell title="FAQ" onBack={() => router.push("/help")}>
      <div className="space-y-3">
        {FAQS.map((item) => (
          <div key={item.q} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold">{item.q}</p>
            <p className="text-sm text-slate-600 mt-2">{item.a}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}