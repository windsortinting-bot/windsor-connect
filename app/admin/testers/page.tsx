"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

type Note = { user_id: string; note: string | null; updated_at: string | null };

export default function AdminTestersPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Note[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const { data } = await supabase
          .from("tester_notes")
          .select("user_id, note, updated_at")
          .order("updated_at", { ascending: false })
          .limit(50);
        setRows((data as Note[]) || []);
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
    <AppShell title="Tester notes" onBack={() => router.push("/admin")}>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">No tester notes yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.user_id} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
              <p className="text-xs text-slate-400 break-all">{row.user_id}</p>
              <p className="mt-2">{row.note}</p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
