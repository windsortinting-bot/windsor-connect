"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Shield, Heart, MessageCircle } from "lucide-react";

const FAQS = [
  {
    q: "How does Windsor Connect work?",
    a: "You get a small daily batch of local profiles. Like or pass. If you both like each other, it’s a match and you can message.",
  },
  {
    q: "Why only a few profiles per day?",
    a: "Windsor is a real city community, not endless scroll. Daily batches keep attention high and reduce burnout.",
  },
  {
    q: "What is a Super Like?",
    a: "You get one Super Like per day. It tells the other person you really want to connect. Super Likes appear first in their Likes list.",
  },
  {
    q: "What is Second Look?",
    a: "If you accidentally pass, Second Look lets you undo your last pass and restore that profile (and refunds that swipe).",
  },
  {
    q: "Why did my match expire?",
    a: "New matches expire after a few days if nobody messages. Send a hello to keep the conversation open.",
  },
  {
    q: "How do I stay safe?",
    a: "Meet in public, tell a friend, never send money, and use Block/Report anytime. Read our Safety tips in Settings.",
  },
  {
    q: "How do I pause or delete my account?",
    a: "Go to Profile → Settings. You can pause (hide from discovery), log out, or delete your account permanently.",
  },
  {
    q: "Who can see my profile?",
    a: "People in the community who pass your filters. Full profile views from Matches are limited to people you’ve matched with.",
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
        <p className="text-slate-500 text-sm mb-8">
          Answers for dating in the 519
        </p>

        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => router.push("/safety")}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center hover:bg-slate-800"
          >
            <Shield className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-300">Safety</span>
          </button>
          <button
            onClick={() => router.push("/terms")}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center hover:bg-slate-800"
          >
            <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-300">Terms</span>
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center hover:bg-slate-800"
          >
            <MessageCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-300">Privacy</span>
          </button>
        </div>

        <div className="space-y-2">
          {FAQS.map((item, i) => {
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
                  <span className="text-sm font-medium text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}