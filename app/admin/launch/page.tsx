"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

type Check = { id: string; label: string; done: boolean };

export default function AdminLaunchPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("launch_checks")
      .select("id, label, done")
      .order("label");
    setRows((data || []) as Check[]);
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        await load();
      } catch {
        setDenied(true);
        setLoading(false);
      }
    };
    run();
  }, []);

  const toggle = async (row: Check) => {
    await supabase
      .from("launch_checks")
      .update({ done: !row.done, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    await load();
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <AppShell title="Launch checklist" onBack={() => router.push("/admin/metrics")}>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => toggle(row)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left flex items-center justify-between"
            >
              <span className="text-sm">{row.label}</span>
              <span className={row.done ? "text-emerald-600 text-sm" : "text-slate-400 text-sm"}>
                {row.done ? "Done" : "Open"}
              </span>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}