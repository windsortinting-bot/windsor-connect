"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

interface FlagRow {
  key: string;
  enabled: boolean;
  note: string | null;
}

export default function AdminFlagsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<FlagRow[]>([]);
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
      .from("feature_flags")
      .select("key, enabled, note")
      .order("key");

    if (error) setMessage(error.message);
    else setRows((data as FlagRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const toggle = async (row: FlagRow) => {
    const next = !row.enabled;
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled: next, updated_at: new Date().toISOString() })
      .eq("key", row.key);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.key === row.key ? { ...r, enabled: next } : r))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading flags...
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

        <h1 className="text-3xl font-bold mb-2">Feature flags</h1>
        <p className="text-slate-500 text-sm mb-6">
          Soft-launch switches without redeploying code
        </p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.key}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-mono text-sm text-white">{row.key}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {row.note || "No description"}
                </p>
              </div>
              <button
                onClick={() => toggle(row)}
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  row.enabled ? "bg-rose-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${
                    row.enabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}