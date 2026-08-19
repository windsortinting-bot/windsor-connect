"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import {
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("waitlist").insert({
      email: email.trim().toLowerCase(),
    });

    if (error) {
      if (error.code === "23505") {
        setStatus("success");
        setMessage("You’re already on the list.");
      } else {
        setStatus("error");
        setMessage(error.message);
      }
    } else {
      setStatus("success");
      setMessage("You’re on the list. Welcome to Windsor Connect.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold">Windsor Connect</span>
          </div>
          <button
            onClick={() => router.push("/auth")}
            className="text-sm text-rose-400 hover:text-rose-300 font-medium"
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1 mb-5">
          <MapPin className="w-3.5 h-3.5" />
          Built for Windsor, ON · 519
        </div>

        <h1 className="text-4xl font-bold leading-tight mb-4">
          Real connections across Walkerville, Riverside, and beyond
        </h1>
        <p className="text-slate-400 text-base mb-8 leading-relaxed">
          A city-first dating app with small daily batches, real messaging, and
          safety tools made for Windsor — not endless swipe fatigue.
        </p>

        <form onSubmit={handleWaitlist} className="space-y-3 mb-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email for early access"
            className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-lg shadow-rose-500/25"
          >
            {status === "loading" ? "Joining..." : "Join Windsor list"}
          </button>
        </form>

        {message && (
          <p
            className={`text-sm mb-6 ${
              status === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={() => router.push("/auth")}
          className="w-full border border-slate-700 hover:bg-slate-900 text-white font-medium py-3 rounded-xl mb-12"
        >
          Create account / Sign in
        </button>

        <div className="grid gap-4 mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Daily curated batch</h3>
              <p className="text-sm text-slate-400 mt-1">
                A handful of people each day — quality over infinite scroll.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Local-first</h3>
              <p className="text-sm text-slate-400 mt-1">
                Neighborhoods, real chat, and people actually in the Windsor
                area.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Safety tools</h3>
              <p className="text-sm text-slate-400 mt-1">
                Block, report, pause profile, and clear community rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500 justify-center">
          <button
            onClick={() => router.push("/terms")}
            className="hover:text-slate-300"
          >
            Terms
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="hover:text-slate-300"
          >
            Privacy
          </button>
          <button
            onClick={() => router.push("/help")}
            className="hover:text-slate-300"
          >
            Help
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Windsor Connect. Built for Windsor, ON.
      </footer>
    </div>
  );
}