"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, MessageCircle } from "lucide-react";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);

      const { data: matchRows, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!matchRows || matchRows.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const otherIds = matchRows.map((m) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", otherIds);

      const formatted = matchRows.map((match) => {
        const otherId =
          match.user1_id === user.id ? match.user2_id : match.user1_id;
        const other = profiles?.find((p) => p.id === otherId);
        return {
          matchId: match.id,
          other,
        };
      });

      setMatches(formatted.filter((m) => m.other));
      setLoading(false);
    };

    loadMatches();
  }, [router]);

  const handleUnmatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to unmatch?")) return;

    await supabase.from("matches").delete().eq("id", matchId);
    setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Matches</h1>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium">No matches yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Keep swiping — your next match is waiting.
            </p>
            <button
              onClick={() => router.push("/swipe")}
              className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
            >
              Go to Swipe
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((item) => (
              <div
                key={item.matchId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4"
              >
                <div
                  className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 cursor-pointer"
                  onClick={() => router.push(`/chat/${item.matchId}`)}
                >
                  {item.other.photo_urls?.[0] ? (
                    <img
                      src={item.other.photo_urls[0]}
                      alt={item.other.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => router.push(`/chat/${item.matchId}`)}
                >
                  <p className="font-semibold text-white truncate">
                    {item.other.first_name}
                    {item.other.age ? `, ${item.other.age}` : ""}
                  </p>
                  <p className="text-sm text-slate-400 truncate">
                    {item.other.neighborhood || "Windsor"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/chat/${item.matchId}`)}
                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700"
                  >
                    <MessageCircle className="w-5 h-5 text-rose-400" />
                  </button>
                  <button
                    onClick={() => handleUnmatch(item.matchId)}
                    className="text-xs text-slate-500 hover:text-rose-400 px-2"
                  >
                    Unmatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}