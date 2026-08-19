"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  MoreVertical,
  Ban,
  Flag,
} from "lucide-react";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const MAX_UNANSWERED = 3;

const ICEBREAKERS = [
  "Coffee in Walkerville or a walk by the river — what’s your vibe?",
  "What’s your favourite spot in Windsor right now?",
  "Honestly, best pizza in the 519 — go.",
  "Are you more downtown nights or quiet Riverside evenings?",
  "What’s something local you’re into that most people miss?",
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherId, setOtherId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("Chat");
  const [otherPhoto, setOtherPhoto] = useState<string | null>(null);
  const [canSend, setCanSend] = useState(true);
  const [limitMessage, setLimitMessage] = useState("");
  const [matchExpired, setMatchExpired] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

      const { data: match } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, expires_at")
        .eq("id", matchId)
        .single();

      if (!match) {
        setLoading(false);
        return;
      }

      if (match.user1_id === user.id) {
        await supabase
          .from("matches")
          .update({ user1_last_read_at: new Date().toISOString() })
          .eq("id", matchId);
      } else {
        await supabase
          .from("matches")
          .update({ user2_last_read_at: new Date().toISOString() })
          .eq("id", matchId);
      }

      if (match.expires_at && new Date(match.expires_at) < new Date()) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("match_id", matchId);

        if ((count ?? 0) === 0) {
          setMatchExpired(true);
          setLoading(false);
          return;
        }
      }

      const oid =
        match.user1_id === user.id ? match.user2_id : match.user1_id;
      setOtherId(oid);

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("first_name, photo_urls")
        .eq("id", oid)
        .single();

      setOtherName(otherProfile?.first_name || "Chat");
      setOtherPhoto(otherProfile?.photo_urls?.[0] || null);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);
      checkSendLimit(msgs ?? [], user.id);
      setLoading(false);
    };

    init();
  }, [matchId, router]);

  useEffect(() => {
    if (!matchId || !userId) return;

    const channel = supabase.channel(`chat-${matchId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const next = [...prev, msg];
            checkSendLimit(next, userId);
            return next;
          });
          setOtherTyping(false);
        }
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId !== userId) {
          setOtherTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setOtherTyping(false), 2000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const broadcastTyping = () => {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId },
    });
  };

  const checkSendLimit = (msgs: Message[], currentUserId: string) => {
    if (msgs.length === 0) {
      setCanSend(true);
      setLimitMessage("");
      return;
    }

    let unanswered = 0;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender_id === currentUserId) unanswered++;
      else break;
    }

    if (unanswered >= MAX_UNANSWERED) {
      setCanSend(false);
      setLimitMessage(
        `You’ve sent ${MAX_UNANSWERED} messages in a row. Wait for a reply.`
      );
    } else {
      setCanSend(true);
      setLimitMessage("");
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !userId || !canSend || matchExpired || sending)
      return;

    setSending(true);
    setNewMessage("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        match_id: matchId,
        sender_id: userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Could not send message.");
      setSending(false);
      return;
    }

    await supabase
      .from("matches")
      .update({
        last_message_at: new Date().toISOString(),
        expires_at: null,
      })
      .eq("id", matchId);

    if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        const next = [...prev, data];
        checkSendLimit(next, userId);
        return next;
      });
    }

    setSending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(newMessage);
  };

  const handleBlock = async () => {
    if (!userId || !otherId) return;
    if (!confirm(`Block ${otherName}?`)) return;

    await supabase.from("blocks").insert({
      blocker_id: userId,
      blocked_id: otherId,
    });
    await supabase.from("matches").delete().eq("id", matchId);
    router.push("/messages");
  };

  const handleReport = async () => {
    if (!userId || !otherId) return;

    const reason = prompt(
      "Why are you reporting?\n\n1 - Harassment\n2 - Spam/scam\n3 - Inappropriate messages\n4 - Other\n\nType 1, 2, 3 or 4:"
    );
    if (!reason) return;

    const reasons: Record<string, string> = {
      "1": "Harassment",
      "2": "Spam/scam",
      "3": "Inappropriate messages",
      "4": "Other",
    };

    await supabase.from("reports").insert({
      reporter_id: userId,
      reported_id: otherId,
      reason: reasons[reason] || "Other",
    });

    alert("Report submitted. Thank you.");
    setMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading chat...
      </div>
    );
  }

  if (matchExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold">This match expired</h2>
        <p className="text-slate-400 mt-2 max-w-xs">
          Neither of you started a conversation in time.
        </p>
        <button
          onClick={() => router.push("/messages")}
          className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  let lastDay = "";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="border-b border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 bg-slate-950/95 backdrop-blur z-10">
        <button
          onClick={() => router.push("/messages")}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {otherPhoto && (
          <button
            onClick={() => otherId && router.push(`/profile/${otherId}`)}
            className="w-9 h-9 rounded-full overflow-hidden bg-slate-800"
          >
            <img
              src={otherPhoto}
              alt={otherName}
              className="w-full h-full object-cover"
            />
          </button>
        )}
        <button
          onClick={() => otherId && router.push(`/profile/${otherId}`)}
          className="font-semibold text-lg flex-1 text-left"
        >
          {otherName}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-400 hover:text-white p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
              <button
                onClick={handleReport}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
              <button
                onClick={handleBlock}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:bg-slate-800"
              >
                <Ban className="w-4 h-4" />
                Block
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="mt-6 mb-4">
            <p className="text-center text-slate-500 text-sm mb-4">
              Break the ice — pick one or write your own
            </p>
            <div className="space-y-2">
              {ICEBREAKERS.map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => sendMessage(line)}
                  disabled={!canSend || sending}
                  className="w-full text-left text-sm bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-800 text-slate-300 rounded-xl px-4 py-3 transition-colors"
                >
                  {line}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          const day = formatDay(msg.created_at);
          const showDay = day !== lastDay;
          lastDay = day;

          return (
            <React.Fragment key={msg.id}>
              {showDay && (
                <div className="text-center text-xs text-slate-500 py-3">
                  {day}
                </div>
              )}
              <div
                className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-rose-500 text-white rounded-br-md"
                      : "bg-slate-800 text-slate-100 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-rose-100/70" : "text-slate-500"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {otherTyping && (
          <div className="flex justify-start mb-1">
            <div className="bg-slate-800 text-slate-400 text-xs px-4 py-2 rounded-2xl rounded-bl-md">
              {otherName} is typing…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!canSend && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-center text-sm text-amber-400 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {limitMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 p-3 flex gap-2 bg-slate-950"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            broadcastTyping();
          }}
          placeholder={canSend ? "Type a message..." : "Waiting for a reply..."}
          disabled={!canSend}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!canSend || !newMessage.trim() || sending}
          className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl px-4 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}