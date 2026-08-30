"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { getNextAction, type NextAction } from "../../lib/nextAction";
import AppShell from "../components/AppShell";

export default function NextBestPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [action, setAction] = useState<NextAction | null>(null);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      setAction(await getNextAction(account.userId));
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Next best step" onBack={() => router.push("/today")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <p className="text-sm text-slate-500">Do this next</p>
        <p className="text-2xl font-bold mt-2">{action?.label || "Loading..."}</p>
        <p className="text-sm text-slate-600 mt-3">{action?.reason}</p>
      </div>
      <button
        type="button"
        disabled={!action}
        onClick={() => action && router.push(action.href)}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
      >
        Go
      </button>
    </AppShell>
  );
}