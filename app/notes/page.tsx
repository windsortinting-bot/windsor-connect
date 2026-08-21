"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

interface NoteRow {
  id: string;
  match_id: string;
  note: string;
  updated_at: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<NoteRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("match_notes")
        .select("id, match_id, note, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      setRows((data as NoteRow[]) || []);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Private notes</h1>
        <p className="text-slate-500 text-sm mb-8">
          Notes only you can see about your matches
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No notes yet. Open a match chat and use the note box there once
            wired, or add notes from the match note editor.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="text-xs text-slate-500 mb-2">
                  Match {r.match_id.slice(0, 8)}...
                </p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                  {r.note}
                </p>
                <button
                  onClick={() => router.push(`/chat/${r.match_id}`)}
                  className="mt-3 text-sm text-rose-600"
                >
                  Open chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}