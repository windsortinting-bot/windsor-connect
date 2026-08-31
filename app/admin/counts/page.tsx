"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

type Row = { label: string; value: string };

export default function AdminCountsPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const [users, likes, notes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("swipes").select("*", { count: "exact", head: true }),
          supabase.from("tester_notes").select("*", { count: "exact", head: true }),
        ]);
        setRows([
          { label: "Profiles", value: String(users.count ?? 0) },
          { label: "Swipes", value: String(likes.count ?? 0) },
          { label: "Tester notes", value: String(notes.count ?? 0) },
        ]);
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
    <AppShell title="Admin counts" onBack={() => router.push("/admin")}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex justify-between text-sm"
          >
            <span>{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
