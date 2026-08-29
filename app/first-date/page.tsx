"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { loadDateIdeas, type DateIdea } from "../../lib/dateIdeas";
import { loadStarters } from "../../lib/starters";
import AppShell from "../components/AppShell";

export default function FirstDatePage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [idea, setIdea] = useState<DateIdea | null>(null);
  const [opener, setOpener] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("neighborhood")
        .eq("id", account.userId)
        .maybeSingle();
      const [ideas, starters] = await Promise.all([
        loadDateIdeas(data?.neighborhood),
        loadStarters(data?.neighborhood),
      ]);
      setIdea(ideas[0] || null);
      setOpener(starters[0] || "Coffee this week?");
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="First date kit" onBack={() => router.push("/matches")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-3">
        <p className="text-xs text-slate-500">Suggested plan</p>
        <p className="font-semibold mt-1">{idea?.title || "Coffee somewhere public"}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <p className="text-xs text-slate-500">Suggested first line</p>
        <p className="mt-1 text-sm">{opener}</p>
      </div>
      <button
        type="button"
        onClick={() => router.push("/safety-checkin")}
        className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm mb-2"
      >
        Leave a safety check-in
      </button>
      <button
        type="button"
        onClick={() => router.push("/messages")}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Open messages
      </button>
    </AppShell>
  );
}