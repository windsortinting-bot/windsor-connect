"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/safety", label: "Stay safe" },
  { href: "/first-match", label: "First match guide" },
  { href: "/profile-score", label: "Profile strength" },
  { href: "/invite", label: "Invite friends" },
  { href: "/support", label: "Support" },
  { href: "/filters", label: "Discovery filters" },
  { href: "/pause", label: "Pause profile" },
  { href: "/blocked", label: "Blocked users" },
  { href: "/settings", label: "All settings" },
  { href: "/status", label: "Service status" },
  { href: "/faq", label: "FAQ" },
  { href: "/feedback", label: "Send feedback" },
];

export default function ResourcesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-6">Resources</h1>

        <div className="space-y-3">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm text-left px-4"
              type="button"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}