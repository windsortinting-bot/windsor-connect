"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Heart, MapPin, Coffee, Sparkles, Beer, Utensils } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
      source: "landing",
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        setStatus("success");
        setMessage("You’re already on the list.");
      } else {
        setStatus("error");
        setMessage(error.message);
      }
      return;
    }

    setStatus("success");
    setMessage("You’re on the Windsor waitlist.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-white">Windsor Connect</span>
          </div>
          <button
            onClick={() => router.push("/auth")}
            className="text-sm bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl"
          >
            Get started
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
          <p className="text-rose-400 text-sm font-medium mb-3 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" />
            Built for Windsor, ON
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Real connections across
            <br />
            Walkerville, Riverside & beyond
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            A city-first dating app for the 519. Small daily batches, local
            profiles, and fewer endless swipe traps.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button
              onClick={() => router.push("/auth")}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Join Windsor Connect
            </button>
            <button
              onClick={() => router.push("/help")}
              className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl"
            >
              How it works
            </button>
          </div>

          <form
            onSubmit={handleWaitlist}
            className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for waitlist updates"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-xl"
            >
              {status === "loading" ? "Joining..." : "Join waitlist"}
            </button>
          </form>
          {message && (
            <p
              className={`mt-3 text-sm ${
                status === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {message}
            </p>
          )}
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">Daily batches</h3>
              <p className="text-sm text-slate-400">
                A focused set of local people each day instead of infinite scroll.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">Local first</h3>
              <p className="text-sm text-slate-400">
                Neighbourhoods, Windsor prompts, and meetups that actually make sense.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Beer className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">Safer chat</h3>
              <p className="text-sm text-slate-400">
                Match expiry, message limits, block/report tools, and safety tips.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">Vito’s Pizzeria energy</h3>
            <p className="text-xs text-rose-400 font-medium mt-0.5">Via Italia</p>
            <p className="text-sm text-slate-400 mt-2">
              Built for real first dates in Windsor — coffee, walks by the river,
              and neighbourhood spots.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Windsor Connect. Built for Windsor, ON.
      </footer>
    </div>
  );
}