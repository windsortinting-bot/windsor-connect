"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

const ITEMS = [
  "I only meet in public for first dates",
  "I don’t share my home address early",
  "I can end a chat without guilt",
  "I won’t send money to anyone I meet here",
  "I can block/report if something feels wrong",
];

export default function BoundariesPage() {
  const router = useRouter();
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc_boundaries");
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        localStorage.setItem("wc_boundaries", JSON.stringify(next));
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

        <h1 className="text-3xl font-bold mb-2">Personal boundaries</h1>
        <p className="text-slate-500 text-sm mb-8">
          A private checklist for yourself
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
      </div>
    </div>
  );
}