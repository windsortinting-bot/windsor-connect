"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { isQuietHoursNow } from "../../lib/quietHours";
import AppShell from "../components/AppShell";

export default function ReadyTonightPage() {
  const router = useRouter();
  const quiet = isQuietHoursNow();

  return (
    <AppShell title="Ready tonight?" onBack={() => router.push("/first-date")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <p className="font-semibold">{quiet ? "Quiet hours are on" : "Good window to message"}</p>
        <p className="text-sm text-slate-600 mt-2">
          {quiet
            ? "You asked this device to stay quieter right now."
            : "Send a short plan, not a long life story."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.push("/openers")}
        className="w-full bg-white border border-slate-200 py-3 rounded-xl mb-2"
      >
        Get an opener
      </button>
      <button
        type="button"
        onClick={() => router.push("/date-ideas")}
        className="w-full bg-white border border-slate-200 py-3 rounded-xl mb-2"
      >
        Pick a place
      </button>
      <button
        type="button"
        onClick={() => router.push("/safety-checkin")}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Leave a check-in
      </button>
    </AppShell>
  );
}