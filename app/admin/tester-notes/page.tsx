"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

type NoteRow = {
  user_id?: string;
  note?: string | null;
  body?: string | null;
  updated_at?: string;
  created_at?: string;
  first_name?: string;
};

export default function AdminTesterNotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<NoteRow[]>([]);
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
        .from("tester_notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setRows([]);
        setLoading(false);
        return;
      }

      const list = (data as NoteRow[]) || [];
      const ids = list.map((r) => r.user_id).filter(Boolean) as string[];
      const names: Record<string, string> = {};
      if (ids.length) {
        const { data: people } = await supabase
          .from("profiles")
          .select("id, first_name")
          .in("id", ids);
        for (const p of people || []) names[p.id] = p.first_name || "Unknown";
      }

      setRows(
        list.map((r) => ({
          ...r,
          first_name: (r.user_id && names[r.user_id]) || r.user_id,
        }))
      );
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading tester notes...
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
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <h1 className="text-3xl font-bold mb-2">Tester notes</h1>
        <p className="text-slate-500 text-sm mb-6">
          Notes testers saved from Settings
        </p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl p-4">
            No tester notes yet. Ask testers to use Settings → Tester notes.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={`${r.user_id || i}`}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="font-semibold">{r.first_name}</p>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                  {r.note || r.body || "Empty note"}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {r.updated_at
                    ? timeAgo(r.updated_at)
                    : r.created_at
                    ? timeAgo(r.created_at)
                    : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
