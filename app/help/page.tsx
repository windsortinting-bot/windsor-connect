"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "How does Windsor Connect work?",
    a: "You complete a local profile, get a small daily batch of people, and swipe. If you both like each other, it’s a match and you can message.",
  },
  {
    q: "Why is there a daily limit?",
    a: "To keep the app focused on real local connections instead of endless scrolling. Limits reset each day.",
  },
  {
    q: "What is a Super Like?",
    a: "You get one Super Like per day. It stands out on the other person’s Likes page so they know you’re especially interested.",
  },
  {
    q: "Why did my match expire?",
    a: "If neither person sends a message within a few days, the match can expire so inboxes don’t fill with dead conversations.",
  },
  {
    q: "How do I pause my profile?",
    a: "Go to Settings and turn on Pause profile. You’ll be hidden from discovery until you unpause.",
  },
  {
    q: "How do I report someone?",
    a: "Use Report on the swipe card, likes card, chat menu, or matches actions. Reports go to the admin review queue.",
  },
  {
    q: "Is this only for Windsor?",
    a: "Yes — Windsor Connect is built for the 519 first: Walkerville, Riverside, Downtown, South Windsor, and nearby neighbourhoods.",
  },
  {
    q: "How do I delete my account?",
    a: "Open Settings → Delete account. This removes your app data. Contact support if you also need auth account removal confirmed.",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Help</h1>
        <p className="text-slate-500 text-sm mb-8">FAQ for Windsor Connect</p>

        <div className="space-y-2 mb-8">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-medium text-slate-100">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => router.push("/safety")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Safety tips
          </button>
          <button
            onClick={() => router.push("/terms")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Terms
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Privacy
          </button>
        </div>
      </div>
    </div>
  );
}