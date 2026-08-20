"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  Flame,
  Heart,
  Users,
  MessageCircle,
  User,
} from "lucide-react";

const HIDDEN_PREFIXES = [
  "/auth",
  "/welcome",
  "/onboarding",
  "/terms",
  "/privacy",
  "/offline",
  "/maintenance",
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    const hide =
      pathname === "/" ||
      HIDDEN_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
    setShow(!hide);
  }, [pathname]);

  useEffect(() => {
    if (!show) return;

    let cancelled = false;

    const loadCounts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data: mySwipes } = await supabase
          .from("swipes")
          .select("target_id")
          .eq("swiper_id", user.id);

        const mySwipeIds = new Set((mySwipes || []).map((s) => s.target_id));

        const { data: incoming } = await supabase
          .from("swipes")
          .select("swiper_id")
          .eq("target_id", user.id)
          .eq("action", "like");

        const pendingLikes = (incoming || []).filter(
          (s) => !mySwipeIds.has(s.swiper_id)
        ).length;

        const { data: matches } = await supabase
          .from("matches")
          .select(
            "id, user1_id, user2_id, last_message_at, user1_last_read_at, user2_last_read_at"
          )
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        // Unique people only (fixes 4 badge vs 2 on page)
        const uniqueOthers = new Set<string>();
        let unread = 0;

        for (const m of matches || []) {
          const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
          uniqueOthers.add(otherId);

          if (!m.last_message_at) continue;
          const lastRead =
            m.user1_id === user.id
              ? m.user1_last_read_at
              : m.user2_last_read_at;
          if (
            !lastRead ||
            new Date(m.last_message_at) > new Date(lastRead)
          ) {
            unread += 1;
          }
        }

        if (!cancelled) {
          setLikesCount(pendingLikes);
          setMatchesCount(uniqueOthers.size);
          setUnreadCount(unread);
        }
      } catch {
        // ignore badge errors
      }
    };

    loadCounts();
    const t = setInterval(loadCounts, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [show, pathname]);

  if (!show) return null;

  const tabs = [
    { href: "/swipe", label: "Swipe", icon: Flame, badge: 0 },
    { href: "/likes", label: "Likes", icon: Heart, badge: likesCount },
    { href: "/matches", label: "Matches", icon: Users, badge: matchesCount },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      badge: unreadCount,
    },
    { href: "/profile", label: "Profile", icon: User, badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex items-center justify-between px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-1 text-[11px] ${
                active ? "text-rose-400" : "text-slate-500"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-rose-400" : ""}`} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-0 right-[18%] min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}