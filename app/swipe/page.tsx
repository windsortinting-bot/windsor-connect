"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, MessageCircle } from "lucide-react";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth");
          return;
        }

        // Get matches the current user is part of
        const { data: matchRows, error: matchError } = await supabase
          .from("matches")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (matchError) {
          console.error("Match error:", matchError);
          setLoading(false);
          return;
        }

        if (!matchRows || matchRows.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Get the other users' profile IDs
        const otherIds = matchRows.map((m) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );

        // Fetch their profiles
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", otherIds);

        if (profileError) {
          console.error("Profile error:", profileError);
          setLoading(false);
          return;
        }

        // Combine match + profile data
        const formatted = matchRows.map((match) => {
          const otherId =
            match.user1_id === user.id ? match.user2_id : match.user1_id;
          const profile =
            profiles?.find((p) => p.id === otherId) || {
              first_name: "Unknown",
              age: null,
              photo_urls: [],
              neighborhood: "",
              city: "Windsor",
            };

          return {
            matchId: match.id,
            matchedAt: match.created_at,
            profile,
          };
        });

        setMatches(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

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
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Matches</h1>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium">No matches yet</p>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
              Keep swiping — your next connection in Windsor could be one like
              away.
            </p>
            <button
              onClick={() => router.push("/swipe")}
              className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm font-medium"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.matchId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4"
              >
                {/* Photo */}
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {match.profile.first_name}
                    {match.profile.age ? `, ${match.profile.age}` : ""}
                  </h3>
                  <p className="text-sm text-slate-400 truncate">
                    {match.profile.neighborhood ||
                      match.profile.city ||
                      "Windsor"}
                  </p>
                </div>

                {/* Chat button */}
                <button
                  onClick={() => router.push(`/chat/${match.matchId}`)}
                  className="p-3 bg-rose-500/10 text-rose-400 rounded-full hover:bg-rose-500/20 transition-colors"
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