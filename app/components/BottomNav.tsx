"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, Flame, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [likesCount, setLikesCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: incoming } = await supabase
        .from("swipes")
        .select("swiper_id")
        .eq("target_id", user.id)
        .eq("action", "like");

      const likerIds = (incoming ?? []).map((s) => s.swiper_id);

      if (likerIds.length > 0) {
        const { data: mySwipes } = await supabase
          .from("swipes")
          .select("target_id")
          .eq("swiper_id", user.id);

        const already = new Set((mySwipes ?? []).map((s) => s.target_id));
        const pending = likerIds.filter((id) => !already.has(id));
        setLikesCount(pending.length);
      } else {
        setLikesCount(0);
      }

      const { data: matchRows } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchRows) {
        const seen = new Set<string>();
        for (const m of matchRows) {
          const other = m.user1_id === user.id ? m.user2_id : m.user1_id;
          seen.add(other);
        }
        setMatchesCount(seen.size);
      } else {
        setMatchesCount(0);
      }
    };

    loadCounts();
    const interval = setInterval(loadCounts, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (
    pathname === "/" ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  const tabs = [
    {
      href: "/swipe",
      label: "Swipe",
      icon: Flame,
      badge: 0,
    },
    {
      href: "/likes",
      label: "Likes",
      icon: Heart,
      badge: likesCount,
    },
    {
      href: "/matches",
      label: "Matches",
      icon: MessageCircle,
      badge: matchesCount,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      badge: 0,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname?.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                active ? "text-rose-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    active && tab.href === "/likes" ? "fill-rose-400" : ""
                  }`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}