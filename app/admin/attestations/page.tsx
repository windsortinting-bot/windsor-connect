"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

type Row = {
  user_id: string;
  lives_in_windsor: boolean;
  note: string | null;
};

export default function AdminAttestationsPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const { data } = await supabase
          .from("city_attestations")
          .select("user_id, lives_in_windsor, note")
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
    <AppShell title="City checks" onBack={() => router.push("/admin/launch")}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.user_id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
            <p className="break-all">{row.user_id}</p>
            <p className="mt-1">{row.lives_in_windsor ? "Local" : "Not local"}</p>
            <p className="text-slate-500">{row.note}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-500">No attestations yet.</p>}
      </div>
    </AppShell>
  );
}