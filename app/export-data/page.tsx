"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { timeAgo } from "../../lib/format";
import AppShell from "../components/AppShell";

type Req = { id: string; status: string; created_at: string };

export default function ExportDataPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [rows, setRows] = useState<Req[]>([]);
  const [status, setStatus] = useState("");

  const load = async (userId: string) => {
    const { data } = await supabase
      .from("export_requests")
      .select("id, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setRows((data || []) as Req[]);
  };

  useEffect(() => {
    if (loading) return;
    if (!account) {
      router.push("/auth");
      return;
    }
    load(account.userId);
  }, [account, loading, router]);

  const requestExport = async () => {
    if (!account) return;
    const { error } = await supabase.from("export_requests").insert({
      user_id: account.userId,
      status: "requested",
    });
    setStatus(error ? error.message : "Request sent");
    if (!error) load(account.userId);
  };

  return (
    <AppShell title="Export my data" onBack={() => router.push("/settings")}>
      <p className="text-sm text-slate-600 mb-4">
        This files a request. An admin can complete it later.
      </p>
      <button
        type="button"
        onClick={requestExport}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Request export
      </button>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
      <div className="mt-6 space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
            {row.status} · {timeAgo(row.created_at)}
          </div>
        ))}
      </div>
    </AppShell>
  );
}