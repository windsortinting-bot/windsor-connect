"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { INTENT_OPTIONS, loadIntent, saveIntent } from "../../lib/intent";
import AppShell from "../components/AppShell";

export default function IntentPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [current, setCurrent] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      setCurrent(await loadIntent(account.userId));
    };
    run();
  }, [account, loading, router]);

  const choose = async (intent: string) => {
    if (!account) return;
    await saveIntent(account.userId, intent);
    setCurrent(intent);
    setStatus("Saved");
  };

  return (
    <AppShell title="What you want" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4">
        This stays on your account for later matching filters.
      </p>
      <div className="space-y-2">
        {INTENT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            className={`w-full rounded-xl py-3 px-4 text-left text-sm border ${
              current === option
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-white border-slate-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {status && <p className="text-sm text-emerald-700 mt-4">{status}</p>}
    </AppShell>
  );
}