"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { requireAdmin } from "../../../lib/adminUsers";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

type Row = {
  id: string;
  first_name: string | null;
  delete_requested_at: string | null;
};

export default function AdminDeletionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      await requireAdmin();
    } catch {
      setDenied(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, delete_requested_at")
      .not("delete_requested_at", "is", null)
      .order("delete_requested_at", { ascending: false });

    if (error) setMessage(error.message);
    else setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pauseNow = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_paused: true, paused_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setMessage(error.message);
    else setMessage("Profile paused while deletion is processed.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading deletion requests...
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
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">Deletion queue</h1>
        <p className="text-slate-500 text-sm mb-6">{rows.length} requests</p>

        {message && (
          <p className="mb-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold">{r.first_name || "Unnamed"}</p>
              <p className="text-xs text-slate-500 mt-1">
                Requested {r.delete_requested_at ? timeAgo(r.delete_requested_at) : "unknown"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 break-all">{r.id}</p>
              <button
                type="button"
                onClick={() => pauseNow(r.id)}
                className="mt-3 text-xs border border-slate-200 rounded-lg px-3 py-1.5"
              >
                Confirm paused
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}