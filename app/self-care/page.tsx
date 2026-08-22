"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TIPS = [
  "Take breaks from swiping if it starts feeling draining.",
  "One good conversation beats twenty empty matches.",
  "Rejection is normal and usually not personal.",
  "Your worth isn’t measured by reply speed.",
];

export default function SelfCarePage() {
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

        <h1 className="text-3xl font-bold mb-2">Dating self-care</h1>
        <p className="text-slate-500 text-sm mb-8">
          Stay grounded while you meet people
        </p>

        <div className="space-y-3">
          {TIPS.map((t) => (
            <div
              key={t}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-700"
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}