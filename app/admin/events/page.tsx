"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

interface EventRow {
  id: string;
  event_name: string;
  user_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<EventRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!me?.is_admin) {
        setDenied(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("app_events")
        .select("id, event_name, user_id, meta, created_at")
        .order("created_at", { ascending: false })
        .limit(150);

      if (error) setMessage(error.message);
      else setRows((data as EventRow[]) || []);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading events...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-slate-500 text-sm mb-6">Recent product analytics</p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
            >
              <p className="text-sm font-medium text-white">{r.event_name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {timeAgo(r.created_at)}
                {r.user_id ? ` · ${r.user_id.slice(0, 8)}` : " · anonymous"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}