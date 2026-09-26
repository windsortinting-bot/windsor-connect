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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f4c9b8", color: "#2a1810" }}
    >
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold">Windsor Connect</span>
        </div>
        <button type="button" onClick={() => router.push("/auth")} className="text-sm font-semibold">
          Sign in
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto px-4 pb-16 w-full">
        <p className="text-center font-bold text-rose-800 mt-2">This is a dating site</p>
        <h1 className="text-4xl font-extrabold leading-tight mb-3 text-center">
          Meet people in Windsor who want to go on real dates.
        </h1>
        <p className="text-center font-medium mb-5" style={{ color: "#4a2f26" }}>
          Men and women in Windsor, LaSalle, Tecumseh and Amherstburg. Build your
          profile now. Swiping opens October 24.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <img
            src="/ads/couple-patio.jpg"
            alt="Couple on a patio date"
            className="w-full h-44 object-cover rounded-2xl"
          />
          <img
            src="/ads/couple-river.jpg"
            alt="Couple walking by the river"
            className="w-full h-44 object-cover rounded-2xl"
          />
          <img
            src="/ads/couple-toast.jpg"
            alt="Couple toasting on a date"
            className="w-full h-44 object-cover rounded-2xl col-span-2"
          />
        </div>

        {live ? (
          <p className="text-2xl font-bold mb-6 text-center">It’s Swipe Day. Sign in.</p>
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
                className="rounded-2xl py-4 text-center"
                style={{ background: "#fff4ee" }}
              >
                <p className="text-2xl font-extrabold tabular-nums">{value}</p>
                <p className="text-[11px] uppercase tracking-wide font-semibold">{label}</p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl mb-3"
        >
          Create your dating profile
        </button>
        <p className="text-sm text-center font-medium mb-8">
          Photo, town, who you want to meet. No swiping until October 24.
        </p>

        <div className="rounded-2xl p-4" style={{ background: "#fff4ee" }}>
          <p className="font-bold mb-1">Just want a reminder?</p>
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
                className="w-full rounded-xl px-4 py-3 outline-none"
                style={{ background: "#fff", border: "1px solid #e8b9a6" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full font-semibold py-2.5 rounded-xl"
                style={{ border: "2px solid #e11d48", color: "#9f1239" }}
              >
                {status === "loading" ? "Saving..." : "Email me on Swipe Day"}
              </button>
            </form>
          )}
          {status === "error" && <p className="text-sm text-rose-800 mt-2">{message}</p>}
        </div>
      </main>
    </div>
  );
}
