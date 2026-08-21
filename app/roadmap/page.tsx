"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const ITEMS = [
  {
    title: "Now",
    body: "Invite-only soft launch, local profiles, swipe, chat, safety tools.",
  },
  {
    title: "Next",
    body: "Better matching quality, stronger moderation queue, smoother onboarding.",
  },
  {
    title: "Later",
    body: "Optional push notifications, richer local events, and polished PWA install.",
  },
];

export default function RoadmapPage() {
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

        <h1 className="text-3xl font-bold mb-2">Roadmap</h1>
        <p className="text-slate-500 text-sm mb-8">
          Where Windsor Connect is headed
        </p>

        <div className="space-y-3">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="font-semibold text-rose-600">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1">{item.body}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/feedback")}
          className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Suggest an improvement
        </button>
      </div>
    </div>
  );
}