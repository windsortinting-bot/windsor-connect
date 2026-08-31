"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function BlockedHelpPage() {
  const router = useRouter();

  return (
    <AppShell title="Block help" onBack={() => router.push("/blocked")}>
      <p className="text-sm text-slate-700 mb-4">
        Block if someone is rude, pushy, or asks for money. You will not see them on swipe after that.
      </p>
      <button
        type="button"
        onClick={() => router.push("/blocked")}
        className="w-full bg-white border border-slate-200 py-3 rounded-xl"
      >
        Open blocked list
      </button>
    </AppShell>
  );
}
