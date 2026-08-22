"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const FLAGS = [
  "Respects a slow pace",
  "Makes clear plans",
  "Consistent communication",
  "Comfortable meeting in public",
  "Doesn’t pressure for photos or money",
  "Handles “no” without anger",
];

export default function GreenFlagsPage() {
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

        <h1 className="text-3xl font-bold mb-2">Green flags</h1>
        <p className="text-slate-500 text-sm mb-8">
          Signs a connection may be worth continuing
        </p>

        <div className="space-y-2">
          {FLAGS.map((f) => (
            <div
              key={f}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}