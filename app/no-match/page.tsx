"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function NoMatchPage() {
  const router = useRouter();

  return (
    <AppShell title="No match yet" onBack={() => router.push("/swipe")}>
      <p className="text-sm text-slate-700 mb-4">
        That is normal on a small city app. Do not swipe everyone in one night.
      </p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/photo-tips")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Photo tips
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
        >
          Fix profile
        </button>
      </div>
    </AppShell>
  );
}
