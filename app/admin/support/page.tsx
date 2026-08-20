"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

interface SupportRow {
  id: string;
  email: string | null;
  subject: string;
  body: string;
  status: string | null;
  created_at: string;
}

export default function AdminSupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<SupportRow[]>([]);
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
      .from("support_messages")
      .select("id, email, subject, body, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMessage(error.message);
    else setRows((data as SupportRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const markClosed = async (id: string) => {
    const { error } = await supabase
      .from("support_messages")
      .update({ status: "closed" })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "closed" } : r))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading support...
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

        <h1 className="text-3xl font-bold mb-2">Support inbox</h1>
        <p className="text-slate-500 text-sm mb-6">{rows.length} messages</p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-medium text-sm">{r.subject}</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    r.status === "closed"
                      ? "border-slate-600 text-slate-500"
                      : "border-amber-500/40 text-amber-300"
                  }`}
                >
                  {r.status || "open"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                {r.email || "no email"} · {timeAgo(r.created_at)}
              </p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {r.body}
              </p>
              {r.status !== "closed" && (
                <button
                  onClick={() => markClosed(r.id)}
                  className="mt-3 w-full text-sm border border-slate-700 rounded-xl py-2 hover:bg-slate-800"
                >
                  Mark closed
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}