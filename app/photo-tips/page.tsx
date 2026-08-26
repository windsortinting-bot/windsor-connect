"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TIPS = [
  "Use a clear face photo as your first picture.",
  "Add one full-body photo in everyday clothes.",
  "Show a hobby or Windsor spot you actually like.",
  "Avoid group shots as the main photo.",
  "Skip heavy filters — people want to recognize you.",
  "Smile in at least one photo.",
];

export default function PhotoTipsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile-score")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile strength
        </button>
        <h1 className="text-3xl font-bold mb-2">Photo tips</h1>
        <p className="text-slate-500 text-sm mb-8">Better photos, better matches</p>
        <div className="space-y-3">
          {TIPS.map((t) => (
            <div key={t} className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}