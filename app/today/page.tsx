"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { loadTodayPin, saveTodayPin } from "../../lib/todayPin";
import { getNextAction, type NextAction } from "../../lib/nextAction";
import AppShell from "../components/AppShell";

const CHOICES = [
  "Send one real message",
  "Fix my photos",
  "Write a better bio",
  "Review likes",
  "Plan one first date",
];

export default function TodayPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [focus, setFocus] = useState(CHOICES[0]);
  const [suggested, setSuggested] = useState<NextAction | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      setFocus(await loadTodayPin(account.userId));
      setSuggested(await getNextAction(account.userId));
    };
    run();
  }, [account, loading, router]);

  const save = async () => {
    if (!account) return;
    await saveTodayPin(account.userId, focus);
    setStatus("Saved");
  };

  return (
    <AppShell title="Today" onBack={() => router.push("/hub")}>
      {suggested && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-500">Best next step</p>
          <p className="font-semibold mt-1">{suggested.label}</p>
          <p className="text-sm text-slate-600 mt-1">{suggested.reason}</p>
          <button
            type="button"
            onClick={() => router.push(suggested.href)}
            className="mt-3 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Do this
          </button>
        </div>
      )}

      <p className="text-sm text-slate-600 mb-3">Or pick your own focus</p>
      <div className="space-y-2 mb-4">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setFocus(choice)}
            className={`w-full text-left rounded-xl py-3 px-4 text-sm border ${
              focus === choice
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-white border-slate-200"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl mb-2"
      >
        Save focus
      </button>
      <button
        type="button"
        onClick={() => router.push("/done-today")}
        className="w-full bg-white border border-slate-200 py-3 rounded-xl"
      >
        I did one thing today
      </button>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
    </AppShell>
  );
}