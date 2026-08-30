"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { loadTodayPin, saveTodayPin } from "../../lib/todayPin";
import { trackEvent } from "../../lib/events";
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
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      setFocus(await loadTodayPin(account.userId));
      await trackEvent("today_opened");
    };
    run();
  }, [account, loading, router]);

  const save = async () => {
    if (!account) return;
    await saveTodayPin(account.userId, focus);
    setStatus("Saved");
  };

  return (
    <AppShell title="Today" onBack={() => router.push("/launch-home")}>
      <p className="text-sm text-slate-600 mb-4">
        Pick one job. Do not try to do the whole app at once.
      </p>
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
        onClick={() => {
          if (focus.includes("photos")) router.push("/photo-check");
          else if (focus.includes("bio")) router.push("/bio-help");
          else if (focus.includes("likes")) router.push("/likes");
          else if (focus.includes("date")) router.push("/first-date");
          else router.push("/messages");
        }}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Start this
      </button>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
    </AppShell>
  );
}