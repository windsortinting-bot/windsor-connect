"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function WeekendPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    try {
      localStorage.setItem("wc_weekend_plan", plan);
      setSaved(true);
    } catch {
      // ignore
    }
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

        <h1 className="text-3xl font-bold mb-2">Weekend plan</h1>
        <p className="text-slate-500 text-sm mb-8">
          Sketch a simple local plan you could invite someone to
        </p>

        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          rows={5}
          placeholder="Example: Saturday afternoon coffee in Walkerville"
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 mb-4"
        />

        <button
          onClick={save}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Save on this device
        </button>

        {saved && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            Saved
          </p>
        )}
      </div>
    </div>
  );
}