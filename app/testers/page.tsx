"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function TestersPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("tester_notes")
        .select("note")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.note) setNote(data.note);
      setReady(true);
    };
    run();
  }, [router]);

  const save = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("tester_notes").upsert({
      user_id: user.id,
      note,
      updated_at: new Date().toISOString(),
    });
    setStatus(
      error
        ? `Could not save (${error.message}). Write it in your phone notes for now.`
        : "Saved."
    );
  };

  if (!ready) {
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
          type="button"
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Tester notes</h1>
        <p className="text-sm text-slate-500 mb-6">
          What broke, on which phone, and which account.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Example: iPhone, gal account, chat said Sent but joe never saw it."
          className="w-full min-h-36 bg-white border border-slate-200 rounded-xl p-3 text-sm mb-3"
        />
        <button
          type="button"
          onClick={save}
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl mb-3"
        >
          Save note
        </button>
        <button
          type="button"
          onClick={() => router.push("/launch-test")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm"
        >
          Open launch checklist
        </button>
        {status && <p className="text-sm text-slate-600 mt-3">{status}</p>}
      </div>
    </div>
  );
}
