"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getUniqueMatchCount } from "../../lib/matching";
import { Heart, Home, MessageCircle, User, Sparkles } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [matchCount, setMatchCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const count = await getUniqueMatchCount(user.id);
      setMatchCount(count);

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
    };

    load();
  }, [pathname]);

  const hideOn = ["/", "/auth", "/onboarding", "/maintenance"];
  if (hideOn.some((p) => pathname === p || pathname?.startsWith("/auth"))) {
    return null;
  }

  const items = [
    { href: "/swipe", label: "Swipe", icon: Home },
    { href: "/likes", label: "Likes", icon: Sparkles, badge: likeCount },
    { href: "/matches", label: "Matches", icon: Heart, badge: matchCount },
    { href: "/messages", label: "Chat", icon: MessageCircle },
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
            >
              <Icon className={`w-5 h-5 ${active ? "fill-rose-500/20" : ""}`} />
              {item.label}
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}