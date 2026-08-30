"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const MAIN = [
  { href: "/today", label: "Today" },
  { href: "/next-best", label: "Next best step" },
  { href: "/swipe", label: "Swipe" },
  { href: "/matches", label: "Matches" },
  { href: "/messages", label: "Messages" },
  { href: "/after-match", label: "After a match" },
];

const PREP = [
  { href: "/self-preview", label: "How you look" },
  { href: "/gaps", label: "Profile gaps" },
  { href: "/openers", label: "Openers" },
  { href: "/plan-text", label: "Plan text" },
  { href: "/first-date", label: "First date kit" },
  { href: "/safety-checkin", label: "Safety check-in" },
];

export default function HubPage() {
  const router = useRouter();

  return (
    <AppShell title="Hub" onBack={() => router.push("/launch-home")}>
      <h2 className="font-semibold mb-2">Use now</h2>
      <div className="space-y-2 mb-6">
        {MAIN.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {item.label}
          </button>
        ))}
      </div>
      <h2 className="font-semibold mb-2">Get ready</h2>
      <div className="space-y-2">
        {PREP.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {item.label}
          </button>
        ))}
      </div>
    </AppShell>
  );
}