"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function NudgePage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [text, setText] = useState("Loading...");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }

      const { count } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1_id.eq.${account.userId},user2_id.eq.${account.userId}`);

      if ((count || 0) > 0) {
        setText("You have a match waiting. Send one specific question, not hey.");
        return;
      }
      setText("No match yet. Spend 5 minutes on swipe, then stop.");
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Nudge" onBack={() => router.push("/today")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <p className="text-lg font-semibold">{text}</p>
      </div>
      <button
        type="button"
        onClick={() => router.push("/after-match")}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl mb-2"
      >
        Go to matches
      </button>
      <button
        type="button"
        onClick={() => router.push("/swipe")}
        className="w-full bg-white border border-slate-200 py-3 rounded-xl"
      >
        Go swipe
      </button>
    </AppShell>
  );
}