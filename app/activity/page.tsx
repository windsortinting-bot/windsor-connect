"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Star,
  Users,
  Bell,
} from "lucide-react";

type ActivityType = "like" | "super_like" | "match" | "message";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  photo: string | null;
  createdAt: string;
  href: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function ActivityPage() {
  const router = useRouter();
  const [items, setItems] = useState<ActivityItem[]>([]);
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

      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", user.id);

      const activities: ActivityItem[] = [];

      // Incoming likes
      const { data: likes } = await supabase
        .from("swipes")
        .select("id, swiper_id, is_super_like, created_at")
        .eq("target_id", user.id)
        .eq("action", "like")
        .order("created_at", { ascending: false })
        .limit(30);

      if (likes && likes.length > 0) {
        const ids = likes.map((l) => l.swiper_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, photo_urls")
          .in("id", ids);
        const map = new Map((profiles ?? []).map((p) => [p.id, p]));

        for (const l of likes) {
          const p = map.get(l.swiper_id);
          const isSuper = !!l.is_super_like;
          activities.push({
            id: `like-${l.id}`,
            type: isSuper ? "super_like" : "like",
            title: p?.first_name || "Someone",
            subtitle: isSuper ? "Super Liked you" : "Liked you",
            photo: p?.photo_urls?.[0] || null,
            createdAt: l.created_at,
            href: "/likes",
          });
        }
      }

      // Matches
      const { data: matchRows } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(30);

      if (matchRows && matchRows.length > 0) {
        const otherIds = matchRows.map((m) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, photo_urls")
          .in("id", otherIds);
        const map = new Map((profiles ?? []).map((p) => [p.id, p]));

        for (const m of matchRows) {
          const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          const p = map.get(otherId);
          activities.push({
            id: `match-${m.id}`,
            type: "match",
            title: p?.first_name || "Someone",
            subtitle: "You matched",
            photo: p?.photo_urls?.[0] || null,
            createdAt: m.created_at,
            href: `/chat/${m.id}`,
          });
        }
      }

      // Recent messages from others
      if (matchRows && matchRows.length > 0) {
        for (const m of matchRows.slice(0, 15)) {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("id, content, sender_id, created_at")
            .eq("match_id", m.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastMsg && lastMsg.sender_id !== user.id) {
            const otherId =
              m.user1_id === user.id ? m.user2_id : m.user1_id;
            const { data: p } = await supabase
              .from("profiles")
              .select("first_name, photo_urls")
              .eq("id", otherId)
              .single();

            activities.push({
              id: `msg-${lastMsg.id}`,
              type: "message",
              title: p?.first_name || "Someone",
              subtitle:
                lastMsg.content.length > 60
                  ? lastMsg.content.slice(0, 60) + "…"
                  : lastMsg.content,
              photo: p?.photo_urls?.[0] || null,
              createdAt: lastMsg.created_at,
              href: `/chat/${m.id}`,
            });
          }
        }
      }

      activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Deduplicate by id
      const seen = new Set<string>();
      const unique = activities.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });

      setItems(unique.slice(0, 50));
      setLoading(false);
    };

    load();
  }, [router]);

  const iconFor = (type: ActivityType) => {
    if (type === "super_like")
      return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
    if (type === "like")
      return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
    if (type === "match") return <Users className="w-4 h-4 text-emerald-400" />;
    return <MessageCircle className="w-4 h-4 text-sky-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-6 h-6 text-rose-400" />
          <h1 className="text-3xl font-bold">Activity</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          Likes, matches, and new messages
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-14 h-14 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">No activity yet</p>
            <p className="text-slate-500 text-sm mt-2">
              When people like you or message you, it shows up here.
            </p>
            <button
              onClick={() => router.push("/swipe")}
              className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
            >
              Go to Swipe
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl p-3 text-left transition-colors"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    {iconFor(item.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-400 truncate">
                    {item.subtitle}
                  </p>
                </div>

                <span className="text-[11px] text-slate-500 flex-shrink-0">
                  {timeAgo(item.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}