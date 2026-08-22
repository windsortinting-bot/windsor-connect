"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const POINTS = [
  {
    title: "Curiosity",
    body: "They ask about you and remember details.",
  },
  {
    title: "Clarity",
    body: "Plans and intentions are easy to understand.",
  },
  {
    title: "Consistency",
    body: "Effort stays steady, not only intense at the start.",
  },
  {
    title: "Comfort",
    body: "You can be honest without walking on eggshells.",
  },
];

export default function ConnectionQualityPage() {
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

        <h1 className="text-3xl font-bold mb-2">Connection quality</h1>
        <p className="text-slate-500 text-sm mb-8">
          A simple lens for whether to keep talking
        </p>

        <div className="space-y-3">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-slate-500 mt-1">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}