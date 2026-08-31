"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function TodayPlanPage() {
  const router = useRouter();

  return (
    <AppShell title="Today" onBack={() => router.push("/welcome-back")}>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/swipe")}
          className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
        >
          Swipe 5 people
        </button>
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Reply to one chat
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Check your photo
        </button>
      </div>
    </AppShell>
  );
}
