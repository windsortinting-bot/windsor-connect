"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import AppShell from "../../components/AppShell";

type Row = { id: string; user_id: string; status: string; created_at: string };

export default function AdminExportsPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const { data } = await supabase
          .from("export_requests")
          .select("id, user_id, status, created_at")
          .order("created_at", { ascending: false });
        setRows((data || []) as Row[]);
      } catch {
        setDenied(true);
      }
    };
    run();
  }, []);

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <AppShell title="Export requests" onBack={() => router.push("/admin/launch")}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
            <p className="break-all">{row.user_id}</p>
            <p className="text-slate-500 mt-1">
              {row.status} · {timeAgo(row.created_at)}
            </p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-500">No requests yet.</p>}
      </div>
    </AppShell>
  );
}