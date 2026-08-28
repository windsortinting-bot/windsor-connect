"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { findDuplicateMatches, type DuplicateMatch } from "../../../lib/duplicates";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

export default function AdminDuplicatesPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<DuplicateMatch[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await findDuplicateMatches();
    setRows(data);
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

  const keepOldest = async (row: DuplicateMatch) => {
    const extras = row.ids.slice(1);
    if (extras.length === 0) return;
    const { error } = await supabase.from("matches").delete().in("id", extras);
    setMessage(error ? error.message : `Removed ${extras.length} extra match row(s)`);
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
    <AppShell title="Duplicate matches" onBack={() => router.push("/admin/metrics")}>
      {message && <p className="text-sm text-emerald-700 mb-3">{message}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Scanning...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No duplicate pairs found.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.pairKey} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-500 break-all">{row.pairKey}</p>
              <p className="text-sm mt-1">{row.ids.length} match rows</p>
              <button
                type="button"
                onClick={() => keepOldest(row)}
                className="mt-3 text-sm bg-rose-500 text-white px-4 py-2 rounded-lg"
              >
                Keep first, delete extras
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}