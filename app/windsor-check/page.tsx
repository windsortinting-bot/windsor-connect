"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function WindsorCheckPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [livesHere, setLivesHere] = useState(true);
  const [note, setNote] = useState("I live in or around Windsor.");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("city_attestations")
        .select("lives_in_windsor, note")
        .eq("user_id", account.userId)
        .maybeSingle();
      if (data) {
        setLivesHere(!!data.lives_in_windsor);
        setNote(data.note || "");
      }
    };
    run();
  }, [account, loading, router]);

  const save = async () => {
    if (!account) return;
    const { error } = await supabase.from("city_attestations").upsert({
      user_id: account.userId,
      lives_in_windsor: livesHere,
      note,
    });
    setStatus(error ? error.message : "Saved");
  };

  return (
    <AppShell title="Windsor check" onBack={() => router.push("/onboarding")}>
      <p className="text-sm text-slate-600 mb-4">
        Soft launch is local-first. This is a self-check, not ID verification.
      </p>
      <label className="flex items-center gap-2 mb-4 text-sm">
        <input
          type="checkbox"
          checked={livesHere}
          onChange={(e) => setLivesHere(e.target.checked)}
        />
        I live in Windsor / Essex
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full min-h-24 bg-white border border-slate-200 rounded-xl p-3 text-sm mb-3"
      />
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Save
      </button>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
    </AppShell>
  );
}