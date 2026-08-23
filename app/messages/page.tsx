"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import EmptyState from "../components/EmptyState";
import { MessageCircle } from "lucide-react";

type Thread = {
  matchId: string;
  otherName: string;
  photo: string | null;
  lastMessage: string | null;
  lastAt: string | null;
};

export default function MessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
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

      const { data: matches } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const seen = new Set<string>();
      const result: Thread[] = [];

      for (const m of matches || []) {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        if (seen.has(otherId)) continue;
        seen.add(otherId);

        const { data: p } = await supabase
          .from("profiles")
          .select("first_name, photo_urls")
          .eq("id", otherId)
          .single();

        let lastMessage: string | null = null;
        let lastAt: string | null = null;

        const { data: msgs } = await supabase
          .from("messages")
          .select("body, created_at")
          .eq("match_id", m.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (msgs?.[0]) {
          lastMessage = msgs[0].body;
          lastAt = msgs[0].created_at;
        }

        result.push({
          matchId: m.id,
          otherName: p?.first_name || "Match",
          photo: p?.photo_urls?.[0] || null,
          lastMessage,
          lastAt,
        });
      }

      setThreads(result);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {threads.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            body="Match with someone first, then chat here."
            actionLabel="View matches"
            onAction={() => router.push("/matches")}
          />
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.matchId}
                onClick={() => router.push(`/chat/${t.matchId}`)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                  {t.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photo}
                      alt={t.otherName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{t.otherName}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {t.lastMessage || "Say hello"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}