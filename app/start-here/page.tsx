"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { getNextAction } from "../../lib/nextAction";
import AppShell from "../components/AppShell";

export default function StartHerePage() {
  const router = useRouter();
  const { account, loading } = useAccount();

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.replace("/auth");
        return;
      }
      const action = await getNextAction(account.userId);
      router.replace(action.href);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Start here">
      <p className="text-sm text-slate-500">Finding the right next page...</p>
    </AppShell>
  );
}