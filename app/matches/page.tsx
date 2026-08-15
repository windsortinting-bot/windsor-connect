"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, MessageCircle } from "lucide-react";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState("Starting...");

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setDebug("Not logged in");
          router.push("/auth");
          return;
        }

        // Show the logged-in user ID
        setDebug("Logged in as: " + user.id);

        const { data: matchRows, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (matchError) {
          setDebug("Error: " + matchError.message + " | User: " + user.id);
          setLoading(false);
          return;
        }

        setDebug("User: " + user.id + " | Found: " + (matchRows?.length || 0) + " matches");

        if (!matchRows || matchRows.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        const otherIds = matchRows.map((m: any) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );

        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", otherIds);

        const formatted = matchRows.map((match: any) => {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const profile = profiles?.find((p: any) => p.id === otherId) || {
            first_name: "Unknown",
            age: null,
            photo_urls: [],
            neighborhood: "",
            city: "Windsor",
          };

          return {
            matchId: match.id,
            profile,
          };
        });

        setMatches(formatted);
      } catch (err: any) {
        setDebug("Crash: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Matches</h1>
        <p className="text-xs text-yellow-400 mb-6 break-all">{debug}</p>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-400">No matches yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.matchId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {match.profile.photo_urls?.[0] ? (
                    <img
                      src={match.profile.photo_urls[0]}
                      alt={match.profile.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Heart className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {match.profile.first_name}
                    {match.profile.age ? `, ${match.profile.age}` : ""}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {match.profile.neighborhood || match.profile.city}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/chat/${match.matchId}`)}
                  className="p-3 bg-rose-500/10 text-rose-400 rounded-full"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}