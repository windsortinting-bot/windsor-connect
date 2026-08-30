"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

type Row = { user_id: string; focus: string | null; updated_at: string };

export default function AdminTodayPinsPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const { data } = await supabase
          .from("today_pins")
          .select("user_id, focus, updated_at")
          .order("updated_at", { ascending: false })
          .limit(50);
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
    <AppShell title="Today pins" onBack={() => router.push("/admin/command")}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.user_id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
            <p>{row.focus || "No focus"}</p>
            <p className="text-xs text-slate-400 break-all mt-1">{row.user_id}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-500">No pins yet.</p>}
      </div>
    </AppShell>
  );
}