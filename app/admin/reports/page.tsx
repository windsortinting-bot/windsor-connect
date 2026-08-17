"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { AlertTriangle, ArrowLeft, Shield, Ban } from "lucide-react";

interface ReportRow {
  id: string;
  reason: string;
  created_at: string;
  reporter_id: string;
  reported_id: string;
  reporter_name?: string;
  reported_name?: string;
  is_banned?: boolean;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const { data: reportRows, error } = await supabase
        .from("reports")
        .select("id, reason, created_at, reporter_id, reported_id")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!reportRows || reportRows.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      const allIds = [
        ...new Set(reportRows.flatMap((r) => [r.reporter_id, r.reported_id])),
      ];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, is_banned")
        .in("id", allIds);

      const map = new Map(
        (profiles ?? []).map((p) => [
          p.id,
          { name: p.first_name, banned: p.is_banned },
        ])
      );

      const enriched: ReportRow[] = reportRows.map((r) => ({
        ...r,
        reporter_name: map.get(r.reporter_id)?.name || "Unknown",
        reported_name: map.get(r.reported_id)?.name || "Unknown",
        is_banned: map.get(r.reported_id)?.banned || false,
      }));

      setReports(enriched);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleBan = async (reportedId: string, name: string) => {
    if (!confirm(`Ban ${name}? They will be hidden from the app.`)) return;

    await supabase
      .from("profiles")
      .update({ is_banned: true, is_paused: true, is_onboarded: false })
      .eq("id", reportedId);

    setReports((prev) =>
      prev.map((r) =>
        r.reported_id === reportedId ? { ...r, is_banned: true } : r
      )
    );

    alert(`${name} has been banned.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading reports...
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <Shield className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-lg font-medium">Access denied</p>
        <button
          onClick={() => router.push("/swipe")}
          className="mt-6 text-rose-400 text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>

        {reports.length === 0 ? (
          <p className="text-slate-500 text-center py-16">No reports yet</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-medium text-white">
                      {r.reported_name}{" "}
                      <span className="text-slate-500 font-normal">
                        was reported
                      </span>
                      {r.is_banned && (
                        <span className="ml-2 text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                          Banned
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      By {r.reporter_name}
                    </p>
                    <p className="text-sm text-rose-400 mt-2">{r.reason}</p>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 flex gap-4 text-xs">
                  <button
                    onClick={() => router.push(`/profile/${r.reported_id}`)}
                    className="text-slate-400 hover:text-white"
                  >
                    View profile
                  </button>
                  {!r.is_banned && (
                    <button
                      onClick={() =>
                        handleBan(r.reported_id, r.reported_name || "user")
                      }
                      className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Ban user
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}