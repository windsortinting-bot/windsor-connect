"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function DoneForTodayPage() {
  const router = useRouter();

  return (
    <AppShell title="Done for today" onBack={() => router.push("/today-plan")}>
      <p className="text-sm text-slate-700 mb-6">
        Stop swiping. Come back tomorrow. Small city apps die when everyone burns the deck in one night.
      </p>
      <button
        type="button"
        onClick={() => router.push("/logout")}
        className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl"
      >
        Log out
      </button>
    </AppShell>
  );
}
