"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { timeAgo } from "../../lib/format";
import AppShell from "../components/AppShell";

type Checkin = { id: string; note: string | null; created_at: string };

export default function SafetyCheckinPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [note, setNote] = useState("Heading out. I'll check in after.");
  const [rows, setRows] = useState<Checkin[]>([]);
  const [status, setStatus] = useState("");

  const load = async (userId: string) => {
    const { data } = await supabase
      .from("safety_checkins")
      .select("id, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    setRows((data || []) as Checkin[]);
  };

  useEffect(() => {
    if (loading) return;
    if (!account) {
      router.push("/auth");
      return;
    }
    load(account.userId);
  }, [account, loading, router]);

  const save = async () => {
    if (!account) return;
    const { error } = await supabase.from("safety_checkins").insert({
      user_id: account.userId,
      note,
    });
    setStatus(error ? error.message : "Check-in saved");
    if (!error) load(account.userId);
  };

  return (
    <AppShell title="Safety check-in" onBack={() => router.push("/safety")}>
      <p className="text-sm text-slate-600 mb-4">
        Leave a private note before a first meet. Only you can see this.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full min-h-28 bg-white border border-slate-200 rounded-xl p-3 text-sm mb-3"
      />
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Save check-in
      </button>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
      <div className="mt-6 space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
            <p>{row.note}</p>
            <p className="text-xs text-slate-400 mt-1">{timeAgo(row.created_at)}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}