"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { unmatchSafe } from "../../lib/matching";
import EmptyState from "../components/EmptyState";
import { MessageCircle, MapPin } from "lucide-react";

type MatchCard = {
  matchId: string;
  otherId: string;
  first_name: string;
  age: number | null;
  neighborhood: string | null;
  photo: string | null;
};

export default function MatchesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = async (uid: string) => {
    setErrorMsg("");

    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        user1_id,
        user2_id,
        created_at,
        user1:profiles!matches_user1_id_fkey ( id, first_name, age, neighborhood, photo_urls ),
        user2:profiles!matches_user2_id_fkey ( id, first_name, age, neighborhood, photo_urls )
      `
      )
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback without embeds if FK names differ
      const { data: plain, error: plainErr } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
        .order("created_at", { ascending: false });

      if (plainErr) {
        setErrorMsg(plainErr.message);
        setMatches([]);
        setLoading(false);
        return;
      }

      const cards: MatchCard[] = [];
      const seen = new Set<string>();

      for (const m of plain || []) {
        const otherId = m.user1_id === uid ? m.user2_id : m.user1_id;
        if (seen.has(otherId)) continue;
        seen.add(otherId);

        const { data: p } = await supabase
          .from("profiles")
          .select("id, first_name, age, neighborhood, photo_urls")
          .eq("id", otherId)
          .single();

        if (!p) continue;
        cards.push({
          matchId: m.id,
          otherId,
          first_name: p.first_name,
          age: p.age,
          neighborhood: p.neighborhood,
          photo: p.photo_urls?.[0] || null,
        });
      }

      setMatches(cards);
      setLoading(false);
      return;
    }

    const cards: MatchCard[] = [];
    const seen = new Set<string>();

    for (const m of data || []) {
      const other =
        (m as any).user1_id === uid ? (m as any).user2 : (m as any).user1;
      if (!other?.id || seen.has(other.id)) continue;
      seen.add(other.id);

      cards.push({
        matchId: (m as any).id,
        otherId: other.id,
        first_name: other.first_name,
        age: other.age,
        neighborhood: other.neighborhood,
        photo: other.photo_urls?.[0] || null,
      });
    }

    setMatches(cards);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      await load(user.id);
    };
    init();
  }, [router]);

  const handleUnmatch = async (matchId: string) => {
    if (!userId) return;
    const ok = window.confirm("Unmatch this person?");
    if (!ok) return;

    const success = await unmatchSafe(matchId, userId);
    if (!success) {
      setErrorMsg("Could not unmatch. Try again.");
      return;
    }

    setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">Matches</h1>
        <p className="text-sm text-slate-500 mb-6">{matches.length} people</p>

        {errorMsg && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {errorMsg}
          </p>
        )}

        {matches.length === 0 ? (
          <EmptyState
            title="No matches yet"
            body="When you both like each other, you’ll appear here."
            actionLabel="Start swiping"
            onAction={() => router.push("/swipe")}
          />
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div
                key={m.matchId}
                className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3"
              >
                <button
                  onClick={() => router.push(`/u/${m.otherId}`)}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0"
                >
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt={m.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </button>

                <button
                  onClick={() => router.push(`/chat/${m.matchId}`)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-semibold truncate">
                    {m.first_name}
                    {m.age ? `, ${m.age}` : ""}
                  </p>
                  {m.neighborhood && (
                    <p className="text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {m.neighborhood}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Click here to chat
                  </p>
                </button>

                <button
                  onClick={() => handleUnmatch(m.matchId)}
                  className="text-xs text-slate-500 hover:text-rose-600 self-start mt-1"
                >
                  Unmatch
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}