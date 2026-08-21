"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import LogoutButton from "./LogoutButton";
import { Heart } from "lucide-react";

const HIDDEN = [
  "/",
  "/auth",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/welcome",
  "/onboarding",
  "/terms",
  "/privacy",
  "/offline",
  "/maintenance",
  "/join",
];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const hide =
      HIDDEN.includes(pathname) ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/join");

    if (hide) {
      setShow(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setShow(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setName(profile?.first_name || "You");
        setShow(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 min-w-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-slate-900 truncate">
              Windsor Connect
            </p>
            <p className="text-[11px] text-slate-500 truncate">Hi, {name}</p>
          </div>
        </button>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => router.push("/profile/menu")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Menu
          </button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}