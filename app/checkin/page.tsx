"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { timeAgo } from "../../lib/format";
import { ArrowLeft } from "lucide-react";

interface Row {
  id: string;
  mood: number | null;
  note: string | null;
  created_at: string;
}

export default function CheckinPage() {
  const router = useRouter();
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data } = await supabase
      .from("checkins")
      .select("id, mood, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("checkins").insert({
      user_id: user.id,
      mood,
      note: note.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await trackEvent("checkin_submitted", { mood });
    setNote("");
    setMessage("Check-in saved");
    await load();
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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Quick check-in</h1>
        <p className="text-slate-500 text-sm mb-8">
          Private mood log for your dating week
        </p>

        <form onSubmit={submit} className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-slate-500 mb-2">How’s it going? (1–5)</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMood(n)}
                  className={`w-10 h-10 rounded-xl border text-sm font-semibold ${
                    mood === n
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Optional note to yourself"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />

          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Save check-in
          </button>
        </form>

        {message && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <h2 className="font-semibold mb-3">Recent</h2>
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No check-ins yet.</p>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3"
              >
                <p className="text-sm font-medium">Mood {r.mood}/5</p>
                <p className="text-xs text-slate-500 mt-1">
                  {timeAgo(r.created_at)}
                </p>
                {r.note && (
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                    {r.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}