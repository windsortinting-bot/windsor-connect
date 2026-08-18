"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, MessageCircle } from "lucide-react";

interface Conversation {
  matchId: string;
  otherId: string;
  firstName: string;
  age: number | null;
  photo: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: boolean;
  isNewMatch: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

      const { data: matchRows, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at, last_message_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!matchRows || matchRows.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Deduplicate by other user
      const seen = new Set<string>();
      const uniqueMatches: typeof matchRows = [];
      for (const m of matchRows) {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        if (!seen.has(otherId)) {
          seen.add(otherId);
          uniqueMatches.push(m);
        }
      }

      const otherIds = uniqueMatches.map((m) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, age, photo_urls")
        .in("id", otherIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const items: Conversation[] = [];

      for (const m of uniqueMatches) {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const profile = profileMap.get(otherId);
        if (!profile) continue;

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("match_id", m.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const unread = !!(lastMsg && lastMsg.sender_id !== user.id);
        const isNewMatch = !lastMsg;

        items.push({
          matchId: m.id,
          otherId,
          firstName: profile.first_name,
          age: profile.age,
          photo: profile.photo_urls?.[0] || null,
          lastMessage: lastMsg?.content || null,
          lastMessageAt: lastMsg?.created_at || m.created_at,
          unread,
          isNewMatch,
        });
      }

      // Sort: unread first, then by last activity
      items.sort((a, b) => {
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return tb - ta;
      });

      setConversations(items);
      setLoading(false);
    };

    load();
  }, [router]);

  const openChat = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading messages...
      </div>
    );
  }

  const newMatches = conversations.filter((c) => c.isNewMatch);
  const activeChats = conversations.filter((c) => !c.isNewMatch);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-slate-500 text-sm mb-6">
          Chat with your matches in Windsor
        </p>

        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium">No messages yet</p>
            <p className="text-slate-500 text-sm mt-2">
              When you match with someone, your conversation will show up here.
            </p>
            <button
              onClick={() => router.push("/swipe")}
              className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
            >
              Go to Swipe
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {newMatches.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-slate-400 mb-3">
                  New matches
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {newMatches.map((c) => (
                    <button
                      key={c.matchId}
                      onClick={() => openChat(c.matchId)}
                      className="flex flex-col items-center gap-2 flex-shrink-0"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 ring-2 ring-rose-500">
                        {c.photo ? (
                          <img
                            src={c.photo}
                            alt={c.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-300 max-w-[64px] truncate">
                        {c.firstName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeChats.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-slate-400 mb-3">
                  Conversations
                </h2>
                <div className="space-y-2">
                  {activeChats.map((c) => (
                    <button
                      key={c.matchId}
                      onClick={() => openChat(c.matchId)}
                      className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl p-3 text-left transition-colors"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                        {c.photo ? (
                          <img
                            src={c.photo}
                            alt={c.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-slate-600" />
                          </div>
                        )}
                        {c.unread && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`font-semibold truncate ${
                              c.unread ? "text-white" : "text-slate-200"
                            }`}
                          >
                            {c.firstName}
                            {c.age ? `, ${c.age}` : ""}
                          </p>
                          {c.unread && (
                            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm mt-0.5 truncate ${
                            c.unread
                              ? "text-white font-medium"
                              : "text-slate-500"
                          }`}
                        >
                          {c.lastMessage || "Say hello…"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeChats.length === 0 && newMatches.length > 0 && (
              <p className="text-center text-slate-500 text-sm">
                Tap a new match above to start chatting
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}