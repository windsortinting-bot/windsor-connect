"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { loadDayDone, markDayDone } from "../../lib/dailyDone";
import AppShell from "../components/AppShell";

export default function DoneTodayPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [note, setNote] = useState("Sent one real message");
  const [saved, setSaved] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const row = await loadDayDone(account.userId);
      if (row?.note) {
        setNote(row.note);
        setSaved(row.note);
      }
    };
    run();
  }, [account, loading, router]);

  const save = async () => {
    if (!account) return;
    await markDayDone(account.userId, note);
    setSaved(note);
    setStatus("Logged");
  };

  return (
    <AppShell title="Done today" onBack={() => router.push("/today")}>
      <p className="text-sm text-slate-600 mb-4">
        One honest action is enough for a soft launch day.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full min-h-24 bg-white border border-slate-200 rounded-xl p-3 text-sm mb-3"
      />
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Save
      </button>
      {saved && <p className="text-sm text-slate-500 mt-3">Today: {saved}</p>}
      {status && <p className="text-sm text-emerald-700 mt-2">{status}</p>}
    </AppShell>
  );
}