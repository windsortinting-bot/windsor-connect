"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Shield, Users, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    // Simple waitlist insert (create table if you want; otherwise just route to auth)
    try {
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
        city: "Windsor",
      });

      if (error) {
        // If waitlist table doesn't exist, still succeed and send them to signup
        console.log(error);
      }

      setStatus("success");
      setMessage("You're on the list. Create your account to start.");
      setTimeout(() => router.push("/auth"), 1200);
    } catch {
      setStatus("success");
      setMessage("You're in. Let's get you set up.");
      setTimeout(() => router.push("/auth"), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-white">Windsor Connect</span>
          </div>
          <button
            onClick={() => router.push("/auth")}
            className="text-sm text-rose-400 hover:text-rose-300 font-medium"
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <MapPin className="w-3.5 h-3.5" />
            Windsor, Ontario · 519
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Real connections
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
              across Windsor
            </span>
          </h1>
          <p className="text-slate-400 mt-4 text-base leading-relaxed max-w-sm mx-auto">
            A city-first dating app for Walkerville, Riverside, Downtown, and
            beyond. Small daily batches. No endless swipe fatigue.
          </p>
        </div>

        <form onSubmit={handleWaitlist} className="space-y-3 mb-12">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3.5 rounded-xl outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-rose-500/25 disabled:opacity-60"
          >
            {status === "loading" ? "Joining..." : "Join Windsor Connect"}
          </button>
          {message && (
            <p
              className={`text-center text-sm ${
                status === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {message}
            </p>
          )}
          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="text-rose-400 hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>

        <div className="grid gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Daily curated batch</h3>
              <p className="text-sm text-slate-400 mt-1">
                A small set of people each day — not infinite scrolling.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Built for the 519</h3>
              <p className="text-sm text-slate-400 mt-1">
                Neighborhoods, local energy, real faces — not a global meat
                market.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Anti-ghost tools</h3>
              <p className="text-sm text-slate-400 mt-1">
                Chat limits, expired dead matches, block & report — less wasted
                time.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Windsor Connect · Built for Windsor, ON
      </footer>
    </div>
  );
}