"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

const ITEMS = [
  "Meet in a public place first",
  "Tell a friend where you’re going",
  "Arrange your own ride there and back",
  "Keep valuables and IDs secure",
  "Don’t share your home address early",
  "Trust your instincts and leave if needed",
];

export default function MeetSafePage() {
  const router = useRouter();
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc_meet_safe");
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        localStorage.setItem("wc_meet_safe", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

        <h1 className="text-3xl font-bold mb-2">Meet safely</h1>
        <p className="text-slate-500 text-sm mb-8">
          Checklist before a first in-person meet in Windsor
        </p>

        <div className="space-y-2">
          {ITEMS.map((label, i) => {
            const on = !!done[i];
            return (
              <button
                key={label}
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 text-left bg-white border border-slate-200 rounded-xl px-4 py-3"
              >
                {on ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-sm ${
                    on ? "text-slate-400 line-through" : "text-slate-800"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/safety")}
          className="mt-8 w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
        >
          Full safety tips
        </button>
      </div>
    </div>
  );
}