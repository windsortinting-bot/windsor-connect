"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { key: "photos", label: "Add at least 2 photos", href: "/onboarding" },
  { key: "bio", label: "Write a short bio", href: "/onboarding" },
  { key: "filters", label: "Set discovery filters", href: "/filters" },
  { key: "swipe", label: "Send your first likes", href: "/swipe" },
  { key: "safety", label: "Read safety tips", href: "/safety" },
];

export default function FirstWeekPage() {
  const router = useRouter();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const raw = localStorage.getItem("wc_first_week");
        if (raw) setDone(JSON.parse(raw));
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const toggle = (key: string) => {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("wc_first_week", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  const completed = Object.values(done).filter(Boolean).length;

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

        <h1 className="text-3xl font-bold mb-2">First-week plan</h1>
        <p className="text-slate-500 text-sm mb-6">
          {completed}/{STEPS.length} complete
        </p>

        <div className="space-y-2">
          {STEPS.map((s) => {
            const on = !!done[s.key];
            return (
              <div
                key={s.key}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <button onClick={() => toggle(s.key)} className="flex-shrink-0">
                  {on ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <button
                  onClick={() => router.push(s.href)}
                  className={`flex-1 text-left text-sm ${
                    on ? "text-slate-400 line-through" : "text-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}