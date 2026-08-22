"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const FLAGS = [
  "Asks for money, gift cards, or crypto",
  "Pushes to leave the app immediately",
  "Avoids video/voice and refuses basic questions",
  "Love-bombs very early then pressures you",
  "Gets angry when you set a boundary",
  "Stories about identity keep changing",
];

export default function RedFlagsPage() {
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

        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Red flags</h1>
        <p className="text-slate-500 text-sm mb-8">
          Common warning signs while dating online
        </p>

        <div className="space-y-2">
          {FLAGS.map((f) => (
            <div
              key={f}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700"
            >
              {f}
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/safety")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Safety tips
          </button>
          <button
            onClick={() => router.push("/meet-safe")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Meet safely checklist
          </button>
        </div>
      </div>
    </div>
  );
}