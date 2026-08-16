"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Users, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function BottomNav() {
  const pathname = usePathname();
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // People who liked you
      const { data: incoming } = await supabase
        .from("swipes")
        .select("swiper_id")
        .eq("target_id", user.id)
        .eq("action", "like");

      if (!incoming || incoming.length === 0) {
        setLikesCount(0);
        return;
      }

      // People you already responded to
      const { data: yourSwipes } = await supabase
        .from("swipes")
        .select("target_id")
        .eq("swiper_id", user.id);

      const alreadySwiped = new Set((yourSwipes ?? []).map((s) => s.target_id));
      const pending = incoming.filter((s) => !alreadySwiped.has(s.swiper_id));
      setLikesCount(pending.length);
    };

    loadCount();

    // Refresh count every time the route changes
    const interval = setInterval(loadCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Don't show nav on auth or landing
  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  const links = [
    { href: "/swipe", icon: Heart, label: "Swipe" },
    { href: "/likes", icon: Heart, label: "Likes", badge: likesCount },
    { href: "/matches", icon: Users, label: "Matches" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md z-40">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center gap-0.5 text-xs ${
                isActive ? "text-rose-500" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "fill-rose-500" : ""}`} />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}