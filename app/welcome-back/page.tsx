"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function WelcomeBackPage() {
  const router = useRouter();
  const [name, setName] = useState("there");
  const [likes, setLikes] = useState(0);
  const [matches, setMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      setName(profile?.first_name || "there");

      const [incoming, matchRows] = await Promise.all([
        supabase
          .from("swipes")
          .select("*", { count: "exact", head: true })
          .eq("target_id", user.id)
          .eq("action", "like"),
        supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
      ]);

      setLikes(incoming.count ?? 0);
      setMatches(matchRows.count ?? 0);
      setLoading(false);
    };
    load();
  }, [router]);

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
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-2">Welcome back, {name}</h1>
        <p className="text-slate-500 text-sm mb-8">
          A quick snapshot before you jump in
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-2xl font-bold">{likes}</p>
            <p className="text-xs text-slate-500 mt-1">Likes received</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-2xl font-bold">{matches}</p>
            <p className="text-xs text-slate-500 mt-1">Matches</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/likes")}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Review likes
          </button>
          <button
            onClick={() => router.push("/swipe")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Start swiping
          </button>
          <button
            onClick={() => router.push("/messages")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Open messages
          </button>
        </div>
      </div>
    </div>
  );
}