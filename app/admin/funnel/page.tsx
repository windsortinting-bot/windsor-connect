"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

export default function AdminFunnelPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
      } catch {
        setDenied(true);
        setLoading(false);
        return;
      }

      const names = ["start_clicked", "welcome_back_viewed", "swipe", "match", "message_sent"];
      const next: Record<string, number> = {};
      for (const name of names) {
        const { count } = await supabase
          .from("app_events")
          .select("*", { count: "exact", head: true })
          .eq("event_name", name);
        next[name] = count || 0;
      }
      setCounts(next);
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
    <AppShell title="Funnel" onBack={() => router.push("/admin/metrics")}>
      {loading ? (
        <p className="text-sm text-slate-500">Loading events...</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(counts).map(([name, value]) => (
            <div key={name} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between">
              <span className="text-sm">{name}</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}