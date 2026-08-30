"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

export default function AdminHealthPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const [profiles, matches, messages, reports, tickets] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("matches").select("*", { count: "exact", head: true }),
          supabase.from("messages").select("*", { count: "exact", head: true }),
          supabase.from("reports").select("*", { count: "exact", head: true }),
          supabase.from("support_tickets").select("*", { count: "exact", head: true }),
        ]);
        setRows([
          { label: "Profiles", value: profiles.count || 0 },
          { label: "Matches", value: matches.count || 0 },
          { label: "Messages", value: messages.count || 0 },
          { label: "Reports", value: reports.count || 0 },
          { label: "Support tickets", value: tickets.count || 0 },
        ]);
      } catch {
        setDenied(true);
      }
      setLoading(false);
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
    <AppShell title="Health" onBack={() => router.push("/admin/command")}>
      {loading ? (
        <p className="text-sm text-slate-500">Checking...</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between">
              <span>{row.label}</span>
              <span className="font-bold">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}