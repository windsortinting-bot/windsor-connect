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

      // Remove duplicates
      const seen = new Set<string>();
      const uniqueMatches: any[] = [];

      for (const match of matchRows) {
        const otherId =
          match.user1_id === user.id ? match.user2_id : match.user1_id;

        if (!seen.has(otherId)) {
          seen.add(otherId);
          uniqueMatches.push(match);
        }
      }

      const otherIds = uniqueMatches.map((m) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", otherIds);

      // Get last message for each match
      const formatted = await Promise.all(
        uniqueMatches.map(async (match) => {
          const otherId =
            match.user1_id === user.id ? match.user2_id : match.user1_id;
          const other = profiles?.find((p) => p.id === otherId);

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("match_id", match.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            matchId: match.id,
            other,
            lastMessage: lastMsg?.content || null,
            lastMessageTime: lastMsg?.created_at || null,
          };
        })
      );

      setMatches(formatted.filter((m) => m.other));
      setLoading(false);
    };

    loadMatches();
  }, [router]);

  const handleUnmatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to unmatch?")) return;

    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId);

    if (error) {
      console.error("Unmatch error:", error);
      alert("Could not unmatch. Please try again.");
      return;
    }

    if (userId) {
      const match = matches.find((m) => m.matchId === matchId);
      if (match?.other?.id) {
        await supabase
          .from("matches")
          .delete()
          .or(
            `and(user1_id.eq.${userId},user2_id.eq.${match.other.id}),and(user1_id.eq.${match.other.id},user2_id.eq.${userId})`
          );
      }
    }

    setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
  };

  const handleBlockFromMatch = async (otherId: string, matchId: string) => {
    if (!userId) return;
    if (!confirm("Block this person? They will be removed from your matches."))
      return;

    await supabase.from("blocks").insert({
      blocker_id: userId,
      blocked_id: otherId,
    });

    await supabase
      .from("matches")
      .delete()
      .or(
        `and(user1_id.eq.${userId},user2_id.eq.${otherId}),and(user1_id.eq.${otherId},user2_id.eq.${userId})`
      );

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
          <div className="space-y-5">
            {matches.map((item) => (
              <div key={item.matchId}>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    {/* Left: photo + View Profile */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800">
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
                      <button
                        onClick={() =>
                          router.push(`/profile/${item.other.id}`)
                        }
                        className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>

                    {/* Right: chat area with last message */}
                    <button
                      onClick={() => router.push(`/chat/${item.matchId}`)}
                      className="flex-1 flex items-center justify-between gap-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl px-4 py-3 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {item.other.first_name}
                          {item.other.age ? `, ${item.other.age}` : ""}
                        </p>
                        <p className="text-sm text-slate-400 mt-0.5 truncate">
                          {item.lastMessage
                            ? item.lastMessage
                            : "Click here to chat"}
                        </p>
                      </div>
                      <MessageCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-1.5 px-1">
                  <button
                    onClick={() => handleUnmatch(item.matchId)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Unmatch
                  </button>
                  <button
                    onClick={() =>
                      handleBlockFromMatch(item.other.id, item.matchId)
                    }
                    className="text-xs text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    Block
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