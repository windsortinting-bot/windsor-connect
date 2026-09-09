"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { blockUser } from "../../../lib/blocks";
import { ArrowLeft } from "lucide-react";

type ReportRow = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string | null;
  created_at: string;
  reporter_name?: string;
  reported_name?: string;
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [message, setMessage] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    setAdminId(user.id);

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
      .select("id, reporter_id, reported_id, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setMessage(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const list = (data as ReportRow[]) || [];
    const ids = Array.from(
      new Set(list.flatMap((r) => [r.reporter_id, r.reported_id]).filter(Boolean))
    );

    let names: Record<string, string> = {};
    if (ids.length) {
      const { data: people } = await supabase
        .from("profiles")
        .select("id, first_name")
        .in("id", ids);
      for (const p of people || []) {
        names[p.id] = p.first_name || "Unknown";
      }
    }

    setRows(
      list.map((r) => ({
        ...r,
        reporter_name: names[r.reporter_id] || r.reporter_id,
        reported_name: names[r.reported_id] || r.reported_id,
      }))
    );
    setMessage("");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const handleBlock = async (reportedId: string) => {
    if (!adminId) return;
    const ok = window.confirm("Block this person from your admin account view / hide them?");
    if (!ok) return;
    try {
      await blockUser(adminId, reportedId);
      setMessage("Blocked.");
    } catch (err: any) {
      setMessage(err?.message || "Could not block");
    }
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
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-slate-500 text-sm mb-6">{rows.length} total</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl p-4">
            No reports yet.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="text-sm font-medium whitespace-pre-wrap">
                  {r.reason || "No reason given"}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {r.reporter_name} reported {r.reported_name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {r.created_at ? timeAgo(r.created_at) : ""}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/u/${r.reported_id}`)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                  >
                    View profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBlock(r.reported_id)}
                    className="text-xs border border-rose-200 text-rose-700 rounded-lg px-3 py-1.5"
                  >
                    Block
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
