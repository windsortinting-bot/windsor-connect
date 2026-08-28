"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { nextRouteForAccount } from "../../lib/session";
import { trackEvent } from "../../lib/events";
import AppShell from "../components/AppShell";

export default function StartPage() {
  const router = useRouter();
  const { account, loading } = useAccount();

  const go = async () => {
    await trackEvent("start_clicked");
    router.push(nextRouteForAccount(account));
  };

  return (
    <AppShell title="Start">
      <p className="text-sm text-slate-600 mb-6">
        This route picks swipe, onboarding, pause, or login for you.
      </p>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
      >
        {loading ? "Checking account..." : "Continue"}
      </button>
    </AppShell>
  );
}