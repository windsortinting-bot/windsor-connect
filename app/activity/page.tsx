"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Heart, MessageCircle, Sparkles } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "like" | "match" | "message";
  title: string;
  subtitle: string;
  photo: string | null;
  href: string;
  at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const activities: ActivityItem[] = [];

      const { data: likes } = await supabase
        .from("swipes")
        .select("id, swiper_id, created_at")
        .eq("target_id", user.id)
        .eq("action", "like")
        .order("created_at", { ascending: false })
        .limit(20);

      if (likes && likes.length) {
        const ids = likes.map((l) => l.swiper_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, photo_urls")
          .in("id", ids);
        const map = new Map((profiles || []).map((p) => [p.id, p]));

        for (const l of likes) {
          const p = map.get(l.swiper_id);
          activities.push({
            id: `like-${l.id}`,
            type: "like",
            title: `${p?.first_name || "Someone"} liked you`,
            subtitle: "Open Likes to respond",
            photo: p?.photo_urls?.[0] || null,
            href: "/likes",
            at: l.created_at,
          });
        }
      }

      const { data: matches } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (matches && matches.length) {
        const otherIds = matches.map((m) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, photo_urls")
          .in("id", otherIds);
        const map = new Map((profiles || []).map((p) => [p.id, p]));

        for (const m of matches) {
          const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          const p = map.get(otherId);
          activities.push({
            id: `match-${m.id}`,
            type: "match",
            title: `You matched with ${p?.first_name || "someone"}`,
            subtitle: "Say hello",
            photo: p?.photo_urls?.[0] || null,
            href: `/chat/${m.id}`,
            at: m.created_at,
          });
        }
      }

      activities.sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      );
      setItems(activities.slice(0, 30));
      setLoading(false);
    };
    load();
  }, [router]);

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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Activity</h1>
        <p className="text-slate-500 text-sm mb-6">Recent likes & matches</p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="w-full text-left bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-800/80"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === "match" ? (
                        <MessageCircle className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Heart className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.subtitle} · {timeAgo(item.at)}
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