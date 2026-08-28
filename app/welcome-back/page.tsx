"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { nextRouteForAccount } from "../../lib/session";
import { trackEvent } from "../../lib/events";
import AppShell from "../components/AppShell";

export default function WelcomeBackPage() {
  const router = useRouter();
  const { account, loading } = useAccount();

  useEffect(() => {
    if (loading) return;
    trackEvent("welcome_back_viewed");
  }, [loading]);

  return (
    <AppShell title="Welcome back">
      <p className="text-sm text-slate-600 mb-6">
        Hi {account?.firstName || "there"}. Pick up where you left off.
      </p>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.push(nextRouteForAccount(account))}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => router.push("/digest")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm"
        >
          See today’s counts
        </button>
        <button
          type="button"
          onClick={() => router.push("/openers")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm"
        >
          Get a first message
        </button>
      </div>
    </AppShell>
  );
}