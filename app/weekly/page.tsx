"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function WeeklyPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [likes, setLikes] = useState(0);
  const [matches, setMatches] = useState(0);
  const [messages, setMessages] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [likeRes, matchRes, msgRes] = await Promise.all([
        supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("target_id", account.userId)
          .eq("action", "like")
          .gte("created_at", since),
        supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .or(`user1_id.eq.${account.userId},user2_id.eq.${account.userId}`)
          .gte("created_at", since),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", account.userId)
          .gte("created_at", since),
      ]);
      setLikes(likeRes.count || 0);
      setMatches(matchRes.count || 0);
      setMessages(msgRes.count || 0);
      setReady(true);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="This week" onBack={() => router.push("/digest")}>
      {!ready ? (
        <p className="text-sm text-slate-500">Counting...</p>
      ) : (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm text-slate-500">New likes</p>
            <p className="text-3xl font-bold text-rose-500">{likes}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm text-slate-500">New matches</p>
            <p className="text-3xl font-bold text-rose-500">{matches}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm text-slate-500">Messages you sent</p>
            <p className="text-3xl font-bold text-rose-500">{messages}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}