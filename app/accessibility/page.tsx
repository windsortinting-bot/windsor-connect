"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AccessibilityPage() {
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

        <h1 className="text-3xl font-bold mb-2">Accessibility</h1>
        <p className="text-slate-500 text-sm mb-8">
          Our goal is a usable app for more people in Windsor
        </p>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Current soft-launch state</p>
            <p className="text-slate-500">
              We use large tap targets, clear labels, and high-contrast rose
              accents on a light background.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Known limits</p>
            <p className="text-slate-500">
              Some swipe gestures and image carousels may be harder with screen
              readers. We’re improving this over time.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Feedback</p>
            <p className="text-slate-500">
              If something is hard to use, send details through Support or Bug
              report so we can prioritize fixes.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/support")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Contact support
          </button>
          <button
            onClick={() => router.push("/bug-report")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Report a bug
          </button>
        </div>
      </div>
    </div>
  );
}