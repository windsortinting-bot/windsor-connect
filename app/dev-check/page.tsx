"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { canMessageNow, canSwipeNow } from "../../lib/swipeGuard";
import AppShell from "../components/AppShell";

export default function DevCheckPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [swipeOk, setSwipeOk] = useState(false);
  const [msgOk, setMsgOk] = useState(false);

  useEffect(() => {
    if (!account) return;
    setSwipeOk(canSwipeNow(account.userId));
    setMsgOk(canMessageNow(account.userId));
  }, [account]);

  return (
    <AppShell title="Dev check" onBack={() => router.push("/version")}>
      {loading ? (
        <p className="text-sm text-slate-500">Loading account...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-sm space-y-2">
          <p>Signed in: {account ? "yes" : "no"}</p>
          <p>Onboarded: {account?.isOnboarded ? "yes" : "no"}</p>
          <p>Paused: {account?.isPaused ? "yes" : "no"}</p>
          <p>Banned: {account?.isBanned ? "yes" : "no"}</p>
          <p>Swipe window: {swipeOk ? "open" : "limited"}</p>
          <p>Message window: {msgOk ? "open" : "limited"}</p>
        </div>
      )}
    </AppShell>
  );
}