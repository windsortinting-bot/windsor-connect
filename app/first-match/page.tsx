"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const STEPS = [
  "Say hello within 24 hours while the match is fresh.",
  "Reference something from their profile (neighborhood, bio, photo).",
  "Suggest a low-pressure plan: coffee, walk, or a quick drink.",
  "Keep the first chat light — save deep topics for later.",
  "If the vibe is off, unmatch politely and keep swiping.",
];

export default function FirstMatchPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/matches")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Matches
        </button>

        <h1 className="text-3xl font-bold mb-2">First match guide</h1>
        <p className="text-slate-500 text-sm mb-8">Simple habits that lead to real dates</p>

        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm"
            >
              <span className="text-rose-500 font-semibold mr-2">{i + 1}.</span>
              {s}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/messages")}
          className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          Open messages
        </button>
      </div>
    </div>
  );
}