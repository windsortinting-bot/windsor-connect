"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = String(params?.matchId || "");
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("Match");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

      const { data: match, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id")
        .eq("id", matchId)
        .maybeSingle();

      if (error || !match) {
        setErrorMsg("This match no longer exists.");
        setLoading(false);
        return;
      }

      if (match.user1_id !== user.id && match.user2_id !== user.id) {
        setErrorMsg("You are not part of this match.");
        setLoading(false);
        return;
      }

      const otherId =
        match.user1_id === user.id ? match.user2_id : match.user1_id;

      const { data: block } = await supabase
        .from("blocks")
        .select("id")
        .or(
          `and(blocker_id.eq.${user.id},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${user.id})`
        )
        .maybeSingle();

      if (block) {
        setErrorMsg("Chat unavailable due to a block.");
        setLoading(false);
        return;
      }

      const { data: other } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", otherId)
        .single();

      setOtherName(other?.first_name || "Match");
      setAllowed(true);

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages((msgs as Msg[]) || []);
      setLoading(false);
    };

    if (matchId) init();
  }, [matchId, router]);

  useEffect(() => {
    if (!allowed || !matchId) return;

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as Msg;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [allowed, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !text.trim() || !allowed) return;

    const body = text.trim();
    setText("");

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      body,
    });

    if (error) {
      setErrorMsg(error.message);
      setText(body);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Opening chat...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.push("/matches")}
            className="flex items-center gap-2 text-slate-500 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Matches
          </button>
          <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {errorMsg || "Chat unavailable"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col pb-24">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push("/matches")}>
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="font-semibold">{otherName}</h1>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  mine
                    ? "ml-auto bg-rose-500 text-white"
                    : "mr-auto bg-white border border-slate-200 text-slate-800"
                }`}
              >
                {m.body}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={send}
          className="sticky bottom-16 max-w-md mx-auto w-full px-4 pb-3"
        >
          <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message..."
              className="flex-1 px-3 py-2 outline-none text-sm bg-transparent"
            />
            <button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}