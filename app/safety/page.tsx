"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

const TIPS = [
  "Meet in a public place for the first few dates.",
  "Tell a friend where you are going and when you expect to be back.",
  "Do not share financial information or send money.",
  "Trust your instincts — you can unmatch or block anytime.",
  "Video chat before meeting if you want extra comfort.",
  "Arrange your own ride to and from the date.",
];

export default function SafetyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-rose-500" />
          <h1 className="text-3xl font-bold">Stay safe</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">Practical tips for Windsor dates</p>

        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div
              key={tip}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700"
            >
              {tip}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/report")}
          className="mt-8 w-full border border-slate-200 bg-white rounded-xl py-3 text-sm"
          type="button"
        >
          Report a user
        </button>
      </div>
    </div>
  );
}