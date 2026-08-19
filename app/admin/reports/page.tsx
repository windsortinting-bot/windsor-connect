"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, Flag } from "lucide-react";

interface ReportRow {
  id: string;
  reason: string | null;
  created_at: string;
  reporter_id: string;
  reported_id: string;
  reporter_name?: string;
  reported_name?: string;
}

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

    const { data: reports, error } = await supabase
      .from("reports")
      .select("id, reason, created_at, reporter_id, reported_id")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const ids = Array.from(
      new Set(
        (reports || []).flatMap((r) => [r.reporter_id, r.reported_id])
      )
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

    const map = new Map((profiles || []).map((p) => [p.id, p.first_name]));

    setRows(
      (reports || []).map((r) => ({
        ...r,
        reporter_name: map.get(r.reporter_id) || "User",
        reported_name: map.get(r.reported_id) || "User",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const banUser = async (reportedId: string, name: string) => {
    if (!confirm(`Ban ${name}? They will be hidden from discovery.`)) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true, is_paused: true })
      .eq("id", reportedId);
    if (error) setMessage(error.message);
    else setMessage(`${name} banned`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading reports...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p>Admin access required.</p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 bg-slate-800 px-6 py-3 rounded-xl text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-slate-500 text-sm mb-6">Review flagged users</p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {rows.length === 0 ? (
          <div className="text-center py-16">
            <Flag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No reports yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <p className="font-medium text-sm">
                  {r.reporter_name} reported {r.reported_name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {r.reason || "No reason"} ·{" "}
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => router.push(`/profile/${r.reported_id}`)}
                    className="flex-1 text-sm border border-slate-700 rounded-xl py-2 hover:bg-slate-800"
                  >
                    View profile
                  </button>
                  <button
                    onClick={() => banUser(r.reported_id, r.reported_name || "user")}
                    className="flex-1 text-sm border border-rose-500/40 text-rose-400 rounded-xl py-2 hover:bg-rose-500/10"
                  >
                    Ban
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