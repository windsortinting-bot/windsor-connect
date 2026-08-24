"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadThreads = async (uid: string) => {
    const { data: matches, error } = await supabase
      .from("matches")
      .select("id, user1_id, user2_id, created_at")
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const seen = new Set<string>();
    const result: Thread[] = [];

    for (const m of matches || []) {
      const otherId = m.user1_id === uid ? m.user2_id : m.user1_id;
      if (seen.has(otherId)) continue;
      seen.add(otherId);

      const { data: p } = await supabase
        .from("profiles")
        .select("first_name, photo_urls")
        .eq("id", otherId)
        .single();

      const { data: msgs } = await supabase
        .from("messages")
        .select("body, content, created_at")
        .eq("match_id", m.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const last = msgs?.[0];
      result.push({
        matchId: m.id,
        otherName: p?.first_name || "Match",
        photo: p?.photo_urls?.[0] || null,
        lastMessage: last?.body || last?.content || null,
        lastAt: last?.created_at || m.created_at,
      });
    }

    result.sort((a, b) => {
      const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tb - ta;
    });

    setThreads(result);
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
      await loadThreads(user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`inbox:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          loadThreads(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

        {errorMsg && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {errorMsg}
          </p>
        )}

        {threads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <p className="font-semibold">No conversations yet</p>
            <p className="text-sm text-slate-500 mt-2">
              Match with someone first, then chat here.
            </p>
            <button
              onClick={() => router.push("/matches")}
              className="mt-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              View matches
            </button>
          </div>
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