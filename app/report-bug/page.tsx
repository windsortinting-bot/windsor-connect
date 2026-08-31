"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function ReportBugPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/auth");
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
      note: note.trim() || "Bug reported with no details",
      updated_at: new Date().toISOString(),
    });
    setStatus(error ? error.message : "Saved to tester notes");
  };

  return (
    <AppShell title="Report a bug" onBack={() => router.push("/help-short")}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What page? What happened?"
        className="w-full min-h-32 bg-white border border-slate-200 rounded-xl p-3 text-sm mb-3"
      />
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Save
      </button>
      {status && <p className="text-sm text-slate-500 mt-3">{status}</p>}
    </AppShell>
  );
}
