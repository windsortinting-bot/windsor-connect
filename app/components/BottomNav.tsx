"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getUniqueMatchCount } from "../../lib/matching";
import { countUnreadMessages } from "../../lib/unread";
import { Heart, Home, MessageCircle, User, Sparkles } from "lucide-react";
import UnreadBadge from "./UnreadBadge";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [matchCount, setMatchCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [matches, unreadCount] = await Promise.all([
      getUniqueMatchCount(user.id),
      countUnreadMessages(user.id),
    ]);
    setMatchCount(matches);
    setUnread(unreadCount);

    const { data: mySwipes } = await supabase
      .from("swipes")
      .select("target_id")
      .eq("swiper_id", user.id);

    const answered = new Set((mySwipes || []).map((s) => s.target_id));

    const { data: incoming } = await supabase
      .from("swipes")
      .select("swiper_id")
      .eq("target_id", user.id)
      .eq("action", "like");

    const pending = (incoming || []).filter((l) => !answered.has(l.swiper_id));
    setLikeCount(pending.length);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 4000);
    const onFocus = () => load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("windsor-nav-refresh", load);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("windsor-nav-refresh", load);
    };
  }, [load, pathname]);

  const hideOn = ["/", "/auth", "/onboarding", "/maintenance"];
  if (hideOn.some((p) => pathname === p || pathname?.startsWith("/auth"))) {
    return null;
  }

  const items = [
    { href: "/swipe", label: "Swipe", icon: Home },
    { href: "/likes", label: likeCount > 0 ? "New likes" : "Likes", icon: Sparkles, badge: likeCount },
    { href: "/matches", label: "Matches", icon: Heart, badge: matchCount },
    { href: "/messages", label: "Chat", icon: MessageCircle, badge: unread },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${
                active ? "text-rose-600" : "text-slate-500"
              }`}
              type="button"
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                <UnreadBadge count={item.badge || 0} />
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
