"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

const ITEMS = [
  "Confirmed time and place",
  "Chose a public location",
  "Told a friend the plan",
  "Charged my phone",
  "Arranged my own ride",
  "Set a personal end time",
];

export default function PreDatePage() {
  const router = useRouter();
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc_pre_date");
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        localStorage.setItem("wc_pre_date", JSON.stringify(next));
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

        <h1 className="text-3xl font-bold mb-2">Pre-date checklist</h1>
        <p className="text-slate-500 text-sm mb-8">
          Before you head out in Windsor
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 mt-0.5" />
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