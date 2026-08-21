"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const DONE = [
  "Invite-only auth",
  "Profiles + onboarding",
  "Swipe / likes / matches",
  "Chat + safety tools",
  "Admin reports & flags",
  "Pause / export / delete account",
];

const NEXT = [
  "More local members",
  "Tighter moderation workflow",
  "Polish based on real feedback",
];

export default function ShippingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Shipping status</h1>
        <p className="text-slate-500 text-sm mb-8">
          Soft-launch readiness snapshot
        </p>

        <h2 className="font-semibold mb-3">Live now</h2>
        <div className="space-y-2 mb-8">
          {DONE.map((item) => (
            <div
              key={item}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
            >
              {item}
            </div>
          ))}
        </div>

        <h2 className="font-semibold mb-3">Focus next</h2>
        <div className="space-y-2">
          {NEXT.map((item) => (
            <div
              key={item}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}