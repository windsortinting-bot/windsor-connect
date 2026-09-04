"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import {
  ChatMessage,
  getMatchParticipant,
  loadMessages,
  markIncomingRead,
  normalizeMessage,
  sendMessage,
} from "../../../lib/chat";
import { broadcastTyping, joinTypingChannel } from "../../../lib/typing";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = String(params?.matchId || "");

  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("Match");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSentId, setLastSentId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      setErrorMsg("");
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);

      if (!matchId || matchId === "undefined") {
        setErrorMsg("Invalid chat link.");
        setLoading(false);
        return;
      }

      try {
        const participant = await getMatchParticipant(matchId, user.id);
        if (!participant) {
          setErrorMsg("This match no longer exists or you are not a participant.");
          setLoading(false);
          return;
        }

        setOtherName(participant.otherName);
        setAllowed(true);

        const msgs = await loadMessages(matchId);
        setMessages(msgs);
        await markIncomingRead(matchId, user.id);
      } catch (err: any) {
        setErrorMsg(err?.message || "Could not open chat");
      }

      setLoading(false);
    };

    if (matchId) init();
  }, [matchId, router]);

  // Realtime message inserts
  useEffect(() => {
    if (!allowed || !matchId || !userId) return;

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = normalizeMessage(payload.new);
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            // Drop matching optimistic pending bubble from same sender/text
            const withoutPending = prev.filter(
              (m) =>
                !(
                  m.pending &&
                  m.sender_id === row.sender_id &&
                  m.body === row.body
                )
            );
            return [...withoutPending, row];
          });

          if (row.sender_id !== userId) {
            markIncomingRead(matchId, userId);
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [allowed, matchId, userId]);

  // Typing channel
  useEffect(() => {
    if (!allowed || !matchId || !userId) return;

    const channel = joinTypingChannel(matchId, userId, () => {
      setOtherTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 1500);
    });

    typingChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [allowed, matchId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const onChangeText = (value: string) => {
    setText(value);
    if (!userId) return;

    const now = Date.now();
    if (now - lastTypingSentRef.current > 800) {
      lastTypingSentRef.current = now;
      broadcastTyping(typingChannelRef.current, userId);
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !text.trim() || !allowed || sending) return;

    const messageText = text.trim();
    setText("");
    setSending(true);
    setErrorMsg("");

    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      match_id: matchId,
      sender_id: userId,
      body: messageText,
      created_at: new Date().toISOString(),
      pending: true,
    };

    // Instant UI
    setMessages((prev) => [...prev, optimistic]);

    try {
      const real = await sendMessage({
        matchId,
        senderId: userId,
        text: messageText,
      });

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === real.id)) return withoutTemp;
        return [...withoutTemp, real];
      });
      setLastSentId(real.id);
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, pending: false, failed: true } : m
        )
      );
      setText(messageText);
      setErrorMsg(err?.message || "Failed to send");
    }

    setSending(false);
  };

  const retryFailed = async (msg: ChatMessage) => {
    if (!userId || sending) return;
    setSending(true);
    setErrorMsg("");

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, pending: true, failed: false } : m
      )
    );

    try {
      const real = await sendMessage({
        matchId,
        senderId: userId,
        text: msg.body,
      });
      setMessages((prev) => {
        const withoutFailed = prev.filter((m) => m.id !== msg.id);
        if (withoutFailed.some((m) => m.id === real.id)) return withoutFailed;
        return [...withoutFailed, real];
      });
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, pending: false, failed: true } : m
        )
      );
      setErrorMsg(err?.message || "Failed to send");
    }

    setSending(false);
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
            type="button"
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/messages")}
            className="text-slate-600"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold truncate">{otherName}</h1>
            <p className="text-[11px] text-slate-400">
              {connected ? "Live" : "Connecting…"}
              {otherTyping ? " · typing…" : ""}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="px-4 pt-3">
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {errorMsg}
            </p>
          </div>
        )}

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto pb-32">
          {messages.length === 0 && (
            <p className="text-center text-sm text-slate-500 mt-8">
              Say hello to {otherName}
            </p>
          )}

          {messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    mine
                      ? "bg-rose-200 text-rose-950"
                      : "bg-white border border-slate-200 text-slate-800"
                  } ${m.pending ? "opacity-70" : ""} ${
                    m.failed ? "ring-2 ring-rose-300" : ""
                  }`}
                >
                  {m.body}
                </div>
                {m.failed && (
                  <button
                    type="button"
                    onClick={() => retryFailed(m)}
                    className="text-[11px] text-rose-600 mt-1"
                  >
                    Not sent · tap to retry
                  </button>
                )}
                {mine && m.pending && !m.failed && (
                  <span className="text-[11px] text-slate-400 mt-1">Sending…</span>
                )}
                {mine && !m.pending && !m.failed && lastSentId === m.id && (
                  <span className="text-[11px] text-emerald-600 mt-1">Sent</span>
                )}
                {mine && !m.pending && !m.failed && lastSentId !== m.id && (
                  <span className="text-[11px] text-slate-400 mt-1">Sent</span>
                )}
              </div>
            );
          })}

          {otherTyping && (
            <div className="mr-auto bg-white border border-slate-200 text-slate-500 text-xs px-3 py-2 rounded-2xl">
              {otherName} is typing…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={send}
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white"
        >
          <div className="max-w-md mx-auto w-full px-4 py-3 flex gap-2">
            <input
              id="chat-message"
              name="chat-message"
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              placeholder="Message..."
              autoComplete="off"
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-rose-400 hover:bg-rose-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-xl"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
          <div className="h-14" />
        </form>
      </div>
    </div>
  );
}