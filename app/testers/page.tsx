"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

const CHECKS = [
  "Sign in works",
  "Profile photo shows",
  "Swipe shows other people",
  "Like creates a pending like",
  "Match opens chat",
  "Message sends",
  "Log out returns to /auth",
];

export default function TestersPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

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
    setStatus(error ? error.message : "Saved");
  };

  return (
    <AppShell title="Tester list" onBack={() => router.push("/profile")}>
      <ul className="text-sm text-slate-700 space-y-2 mb-4">
        {CHECKS.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What broke?"
        className="w-full min-h-28 bg-white border border-slate-200 rounded-xl p-3 text-sm mb-3"
      />
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Save note
      </button>
      {status && <p className="text-sm text-slate-500 mt-3">{status}</p>}
    </AppShell>
  );
}
