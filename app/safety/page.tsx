"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Users,
} from "lucide-react";

const TIPS = [
  {
    icon: MapPin,
    title: "Meet in public first",
    body: "Coffee in Walkerville, a walk by the river, or a busy restaurant. Avoid private homes on the first meet.",
  },
  {
    icon: Users,
    title: "Tell a friend",
    body: "Share the person’s name, where you’re going, and when you expect to be back.",
  },
  {
    icon: MessageCircle,
    title: "Keep early chat in-app",
    body: "Stay on Windsor Connect until you feel comfortable. Don’t rush to share your number or socials.",
  },
  {
    icon: AlertTriangle,
    title: "Never send money",
    body: "No one legitimate will ask you for gift cards, crypto, deposits, or emergency cash. Report and block immediately.",
  },
  {
    icon: Shield,
    title: "Trust your gut",
    body: "If something feels off, leave. Use Block and Report in the app. You don’t owe anyone an explanation.",
  },
];

export default function SafetyPage() {
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

        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-rose-400" />
          <h1 className="text-3xl font-bold">Safety</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          Dating tips for real life in Windsor
        </p>

        <div className="space-y-3 mb-8">
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-white mb-2">In the app</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• Block — stops contact and hides you from each other</li>
            <li>• Report — sends a flag for review</li>
            <li>• Pause profile — hide from discovery anytime</li>
            <li>• Unmatch — end a connection from Matches</li>
          </ul>
        </div>

        <button
          onClick={() => router.push("/help")}
          className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
        >
          Open Help & FAQ
        </button>
      </div>
    </div>
  );
}