"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const RULES = [
  "Be honest about who you are.",
  "No harassment, hate, or threats.",
  "No soliciting money, crypto, or gifts.",
  "No explicit photos on public profiles.",
  "Report problems instead of escalating in chat.",
];

export default function GuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/safety")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Safety
        </button>
        <h1 className="text-3xl font-bold mb-2">Community guidelines</h1>
        <p className="text-slate-500 text-sm mb-8">Simple rules for a small city app</p>
        <div className="space-y-3">
          {RULES.map((r) => (
            <div key={r} className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm">
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}