"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function NoteEditorPage() {
  const router = useRouter();
  const [matchId, setMatchId] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("matchId");
    if (id) setMatchId(id);
  }, []);

  useEffect(() => {
    const loadExisting = async () => {
      if (!matchId) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("match_notes")
        .select("note")
        .eq("user_id", user.id)
        .eq("match_id", matchId)
        .maybeSingle();

      if (data?.note) setNote(data.note);
    };
    loadExisting();
  }, [matchId, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId.trim() || !note.trim()) {
      setStatus("error");
      setMessage("Match ID and note are required");
      return;
    }

    setStatus("loading");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("match_notes").upsert(
      {
        user_id: user.id,
        match_id: matchId.trim(),
        note: note.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" }
    );

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Note saved");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/notes")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Notes
        </button>

        <h1 className="text-3xl font-bold mb-2">Edit note</h1>
        <p className="text-slate-500 text-sm mb-8">Private to you only</p>

        <form onSubmit={save} className="space-y-4">
          <input
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Match ID"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            placeholder="Your private note..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Saving..." : "Save note"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm rounded-xl px-4 py-3 border ${
              status === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-rose-700 bg-rose-50 border-rose-200"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}