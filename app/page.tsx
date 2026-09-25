"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const LAUNCH_AT = "2026-10-24T19:00:00-04:00";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function split(ms: number): Parts {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function CountdownLanding() {
  const router = useRouter();
  const launch = useMemo(() => new Date(LAUNCH_AT).getTime(), []);
  const [now, setNow] = useState(Date.now());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = split(launch - now);
  const live = now >= launch;

  const joinList = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) {
      setStatus("error");
      setMessage("Enter a real email.");
      return;
    }
    setStatus("loading");
    setMessage("");
    const { error } = await supabase.from("waitlist").insert({ email: clean });
    if (error) {
      setStatus("error");
      setMessage(
        error.message.includes("duplicate") || error.code === "23505"
          ? "You’re already on the list."
          : error.message
      );
      return;
    }
    setStatus("success");
    setMessage("Saved. Create your profile next so you’re ready on Swipe Day.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#f4e7e4] text-slate-900 flex flex-col">
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-rose-400 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-semibold">Windsor Connect</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="text-sm text-slate-600"
        >
          Sign in
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto px-4 pb-16 w-full">
        <p className="text-rose-600 text-sm font-medium mt-6 mb-2 text-center">
          Dating for Windsor and nearby
        </p>
        <h1 className="text-4xl font-bold leading-tight mb-3 text-center">
          A dating site for people who live here.
        </h1>
        <p className="text-slate-600 mb-6 text-center">
          Match with people in Windsor, LaSalle, Tecumseh, Amherstburg and the
          towns next door. Swiping opens October 24. Build your profile now.
          On Swipe Day you’re already in the deck.
        </p>

        {live ? (
          <p className="text-2xl font-bold mb-6 text-center">
            It’s Swipe Day. Sign in and swipe.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              ["Days", left.days],
              ["Hours", left.hours],
              ["Min", left.minutes],
              ["Sec", left.seconds],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="bg-white rounded-2xl py-4 border border-rose-100 text-center"
              >
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl mb-3"
        >
          Create your profile
        </button>
        <p className="text-xs text-slate-500 text-center mb-8">
          Photo, town, who you’re looking for. No swiping until October 24.
        </p>

        <div className="bg-white border border-rose-100 rounded-2xl p-4">
          <p className="font-medium mb-1">Just want a reminder?</p>
          <p className="text-sm text-slate-500 mb-3">
            Email only. We’ll tell you when Swipe Day starts.
          </p>
          {status === "success" ? (
            <p className="text-sm font-semibold">{message}</p>
          ) : (
            <form onSubmit={joinList} className="space-y-2">
              <input
                type="email"
                name="email"
                id="waitlist-email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border border-rose-200 rounded-xl px-4 py-3 outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full border border-rose-300 text-rose-800 font-medium py-2.5 rounded-xl"
              >
                {status === "loading" ? "Saving..." : "Email me on Swipe Day"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="text-sm text-rose-700 mt-2">{message}</p>
          )}
        </div>
      </main>
    </div>
  );
}
