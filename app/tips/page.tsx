"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Camera, Shield, Heart } from "lucide-react";

const TIPS = [
  {
    icon: Camera,
    title: "Use clear recent photos",
    body: "At least one clear face photo helps a lot. Natural light beats heavy filters.",
  },
  {
    icon: MessageCircle,
    title: "Open with something local",
    body: "Mention Walkerville, the river, or a real Windsor spot. Generic hellos get ignored.",
  },
  {
    icon: Heart,
    title: "Keep first dates simple",
    body: "Coffee or a short walk is enough. Save long dinners for round two.",
  },
  {
    icon: Shield,
    title: "Trust your gut",
    body: "If chat feels off, use Block/Report. You don’t owe anyone a conversation.",
  },
];

export default function TipsPage() {
  const router = useRouter();

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

        <h1 className="text-3xl font-bold mb-2">Dating tips</h1>
        <p className="text-slate-500 text-sm mb-8">
          Practical tips for better matches in Windsor
        </p>

        <div className="space-y-3">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{tip.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/icebreakers")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Icebreakers
          </button>
          <button
            onClick={() => router.push("/date-ideas")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Date ideas
          </button>
          <button
            onClick={() => router.push("/safety")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Safety tips
          </button>
        </div>
      </div>
    </div>
  );
}