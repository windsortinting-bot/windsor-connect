"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { requireAdmin } from "../../../lib/adminUsers";
import AppShell from "../../components/AppShell";

export default function AdminMetricsPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [counts, setCounts] = useState({
    profiles: 0,
    matches: 0,
    messages: 0,
    events: 0,
  });
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

      const [profiles, matches, messages, events] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("app_events").select("*", { count: "exact", head: true }),
      ]);

      setCounts({
        profiles: profiles.count || 0,
        matches: matches.count || 0,
        messages: messages.count || 0,
        events: events.count || 0,
      });
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
    <AppShell title="Metrics" onBack={() => router.push("/admin/menu-extra")}>
      {loading ? (
        <p className="text-sm text-slate-500">Loading counts...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Profiles</p>
            <p className="text-2xl font-bold">{counts.profiles}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Matches</p>
            <p className="text-2xl font-bold">{counts.matches}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Messages</p>
            <p className="text-2xl font-bold">{counts.messages}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Events</p>
            <p className="text-2xl font-bold">{counts.events}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}