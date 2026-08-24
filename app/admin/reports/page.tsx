"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

type ReportRow = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  status: string | null;
  created_at: string;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [message, setMessage] = useState("");

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
      .from("reports")
      .select("id, reporter_id, reported_id, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMessage(error.message);
    else setRows((data as ReportRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const setStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();

    const { error } = await supabase.from("reports").update(patch).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading reports...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-slate-500 text-sm mb-6">{rows.length} total</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="text-sm font-medium whitespace-pre-wrap">{r.reason}</p>
              <p className="text-xs text-slate-500 mt-2">
                Status: {r.status || "open"} · {timeAgo(r.created_at)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 break-all">
                reported: {r.reported_id}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "open")}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "reviewing")}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                >
                  Reviewing
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(r.id, "resolved")}
                  className="text-xs border border-emerald-200 text-emerald-700 rounded-lg px-3 py-1.5"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}