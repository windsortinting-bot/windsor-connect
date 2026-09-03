"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, Sparkles, Shield, MessageCircle } from "lucide-react";

const SLIDES = [
  {
    icon: Sparkles,
    title: "Small daily batches",
    body: "You get a limited set of people each day. Take your time — quality over endless scrolling.",
  },
  {
    icon: Heart,
    title: "Likes & Super Likes",
    body: "Like someone to connect. Use your 1 Super Like per day when you’re sure.",
  },
  {
    icon: MessageCircle,
    title: "Match → Message",
    body: "When you both like each other, say hello. Matches can expire if nobody messages.",
  },
  {
    icon: Shield,
    title: "Stay safe in Windsor",
    body: "Meet in public, use Block/Report, and never send money. You’re in control.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
    };
    load();
  }, [router]);

  const finish = async () => {
    if (userId) {
      await supabase
        .from("profiles")
        .update({ seen_welcome: true })
        .eq("id", userId);
    }
    router.push("/profile");
  };

  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="text-slate-400 hover:text-white text-sm mb-6"
        >
          ← Back to profile
        </button>
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-3">{slide.title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          {slide.body}
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-rose-500" : "w-2 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Next
          </button>
        ) : (
          <button
            onClick={finish}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl"
          >
            Go to my profile
          </button>
        )}

        <button
          onClick={finish}
          className="mt-4 text-sm text-slate-500 hover:text-slate-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}