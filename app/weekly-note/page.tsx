"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

function weekStart(d = new Date()) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy.toISOString().slice(0, 10);
}

export default function WeeklyNotePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const start = weekStart();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("weekly_notes")
        .select("note")
        .eq("user_id", user.id)
        .eq("week_start", start)
        .maybeSingle();
      if (data?.note) setNote(data.note);
      setLoading(false);
    };
    init();
  }, [router, start]);

  const save = async () => {
    if (!userId || !note.trim()) return;
    const { error } = await supabase.from("weekly_notes").upsert({
      user_id: userId,
      week_start: start,
      note: note.trim(),
    });
    setMessage(error ? error.message : "Saved this week’s note.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/resources")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Resources
        </button>

        <h1 className="text-3xl font-bold mb-2">This week</h1>
        <p className="text-slate-500 text-sm mb-8">Week of {start}</p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          placeholder="What felt good this week? Who do you want to message?"
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4"
        />
        <button
          onClick={save}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          Save
        </button>
        {message && (
          <p className="mt-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}