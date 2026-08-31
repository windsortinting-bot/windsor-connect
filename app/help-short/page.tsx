"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function HelpShortPage() {
  const router = useRouter();

  return (
    <AppShell title="Help" onBack={() => router.push("/support")}>
      <div className="space-y-3 text-sm text-slate-700">
        <p>Cannot sign in: open /auth/env-check. Env must say yes.</p>
        <p>No people on swipe: you may have already swiped them, or filters are tight.</p>
        <p>Cannot message: you need a match first.</p>
        <p>Need to switch testers: use /switch-account.</p>
      </div>
      <button
        type="button"
        onClick={() => router.push("/report-bug")}
        className="w-full mt-6 bg-white border border-slate-200 py-3 rounded-xl"
      >
        Report a bug
      </button>
    </AppShell>
  );
}
