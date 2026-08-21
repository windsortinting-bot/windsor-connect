"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function StatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    likesSent: 0,
    likesReceived: 0,
    matches: 0,
    messagesSent: 0,
  });

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const [sent, received, matches, messages] = await Promise.all([
        supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("swiper_id", user.id)
          .eq("action", "like"),
        supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("target_id", user.id)
          .eq("action", "like"),
        supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", user.id),
      ]);

      setStats({
        likesSent: sent.count ?? 0,
        likesReceived: received.count ?? 0,
        matches: matches.count ?? 0,
        messagesSent: messages.count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading stats...
      </div>
    );
  }

  const cards = [
    { label: "Likes sent", value: stats.likesSent },
    { label: "Likes received", value: stats.likesReceived },
    { label: "Matches", value: stats.matches },
    { label: "Messages sent", value: stats.messagesSent },
  ];

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

        <h1 className="text-3xl font-bold mb-2">Your stats</h1>
        <p className="text-slate-500 text-sm mb-8">
          Soft-launch activity for your account
        </p>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}