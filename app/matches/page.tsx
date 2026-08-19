"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, MessageCircle, MapPin, Clock } from "lucide-react";

interface MatchItem {
  matchId: string;
  otherId: string;
  firstName: string;
  age: number | null;
  neighborhood: string | null;
  photo: string | null;
  lastActiveAt: string | null;
  expiresAt: string | null;
  hasMessages: boolean;
}

function lastActiveLabel(iso: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 15) return "Active now";
  if (mins < 60) return `Active ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Active yesterday";
  if (days < 7) return `Active ${days}d ago`;
  return null;
}

function expiryLabel(expiresAt: string | null, hasMessages: boolean) {
  if (hasMessages || !expiresAt) return null;
  const end = new Date(expiresAt).getTime();
  const left = end - Date.now();
  if (left <= 0) return "Expired soon — message to keep";
  const hours = Math.floor(left / 3600000);
  if (hours < 1) return "Expires in under 1 hour";
  if (hours < 24) return `Expires in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Expires in ${days}d`;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);

      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", user.id);

      const { data: matchRows, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at, expires_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Match query error:", error);
        setLoading(false);
        return;
      }

      if (!matchRows || matchRows.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const seen = new Set<string>();
      const unique: typeof matchRows = [];
      for (const m of matchRows) {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        if (!seen.has(otherId)) {
          seen.add(otherId);
          unique.push(m);
        }
      }

      const otherIds = unique.map((m) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, age, neighborhood, photo_urls, last_active_at")
        .in("id", otherIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const items: MatchItem[] = [];

      for (const m of unique) {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const p = profileMap.get(otherId);
        if (!p) continue;

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("match_id", m.id);

        items.push({
          matchId: m.id,
          otherId,
          firstName: p.first_name,
          age: p.age,
          neighborhood: p.neighborhood,
          photo: p.photo_urls?.[0] || null,
          lastActiveAt: p.last_active_at || null,
          expiresAt: m.expires_at || null,
          hasMessages: (count ?? 0) > 0,
        });
      }

      setMatches(items);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleUnmatch = async (matchId: string) => {
    if (!userId) return;
    if (!confirm("Unmatch this person? Chat history will be removed.")) return;

    await supabase.from("messages").delete().eq("match_id", matchId);
    await supabase.from("matches").delete().eq("id", matchId);
    setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
  };

  const handleBlock = async (
    matchId: string,
    otherId: string,
    name: string
  ) => {
    if (!userId) return;
    if (!confirm(`Block ${name}?`)) return;

    await supabase.from("blocks").insert({
      blocker_id: userId,
      blocked_id: otherId,
    });
    await supabase.from("messages").delete().eq("match_id", matchId);
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
        <h1 className="text-3xl font-bold mb-2">Matches</h1>
        <p className="text-slate-500 text-sm mb-6">
          {matches.length} match{matches.length === 1 ? "" : "es"}
        </p>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium">No matches yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Keep swiping — matches will show up here.
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
            {matches.map((m) => {
              const active = lastActiveLabel(m.lastActiveAt);
              const exp = expiryLabel(m.expiresAt, m.hasMessages);
              return (
                <div
                  key={m.matchId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/chat/${m.matchId}`)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={m.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-7 h-7 text-slate-600" />
                        </div>
                      )}
                      {active === "Active now" && (
                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-lg">
                        {m.firstName}
                        {m.age ? `, ${m.age}` : ""}
                      </p>
                      {m.neighborhood && (
                        <div className="flex items-center gap-1 text-rose-400 text-sm mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {m.neighborhood}
                        </div>
                      )}
                      {active && (
                        <p className="text-xs text-emerald-400/90 mt-1">
                          {active}
                        </p>
                      )}
                      {exp && (
                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exp}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Click here to chat
                      </p>
                    </div>
                  </button>

                  <div className="flex gap-3 mt-4 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => router.push(`/profile/${m.otherId}`)}
                      className="flex-1 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-xl py-2"
                    >
                      View profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnmatch(m.matchId)}
                      className="flex-1 text-sm text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl py-2"
                    >
                      Unmatch
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleBlock(m.matchId, m.otherId, m.firstName)
                      }
                      className="flex-1 text-sm text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl py-2"
                    >
                      Block
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}