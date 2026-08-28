"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useAccount } from "../../lib/useAccount";
import AppShell from "../components/AppShell";

export default function DigestPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [likes, setLikes] = useState(0);
  const [matches, setMatches] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }

      const [{ count: likeCount }, { count: matchCount }] = await Promise.all([
        supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("target_id", account.userId)
          .eq("action", "like"),
        supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .or(`user1_id.eq.${account.userId},user2_id.eq.${account.userId}`),
      ]);

      setLikes(likeCount || 0);
      setMatches(matchCount || 0);
      setReady(true);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Today" onBack={() => router.push("/profile")}>
      {!ready ? (
        <p className="text-sm text-slate-500">Counting...</p>
      ) : (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm text-slate-500">Likes received</p>
            <p className="text-3xl font-bold text-rose-500">{likes}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm text-slate-500">Matches</p>
            <p className="text-3xl font-bold text-rose-500">{matches}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/likes")}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Review likes
          </button>
        </div>
      )}
    </AppShell>
  );
}