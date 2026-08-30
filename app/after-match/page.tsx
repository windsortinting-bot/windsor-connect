"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

type MatchRow = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export default function AfterMatchPickerPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [rows, setRows] = useState<MatchRow[]>([]);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${account.userId},user2_id.eq.${account.userId}`)
        .order("created_at", { ascending: false })
        .limit(20);
      setRows((data || []) as MatchRow[]);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="After a match" onBack={() => router.push("/matches")}>
      <p className="text-sm text-slate-600 mb-4">
        Pick a match and follow the short checklist.
      </p>
      <div className="space-y-2">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => router.push(`/after-match/${row.id}`)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left text-sm"
          >
            Open checklist
            <span className="block text-xs text-slate-400 break-all mt-1">{row.id}</span>
          </button>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-slate-500">No matches yet.</p>
        )}
      </div>
    </AppShell>
  );
}