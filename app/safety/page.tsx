"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Eye,
  MapPin,
  MessageCircle,
  AlertTriangle,
  UserX,
} from "lucide-react";

export default function SafetyPage() {
  const router = useRouter();

  const tips = [
    {
      icon: Eye,
      title: "Meet in public first",
      body: "Choose a busy café, restaurant, or event in Windsor for your first meet. Tell a friend where you’re going.",
    },
    {
      icon: MapPin,
      title: "Stay in Windsor / Essex",
      body: "Prefer first dates in Walkerville, Downtown, Riverside, or other familiar spots. Avoid isolated locations.",
    },
    {
      icon: MessageCircle,
      title: "Keep early chats on the app",
      body: "Don’t rush to share your phone number or socials. Use Windsor Connect until you feel comfortable.",
    },
    {
      icon: UserX,
      title: "Trust your gut — Block freely",
      body: "If someone makes you uncomfortable, Block them. You don’t owe anyone an explanation.",
    },
    {
      icon: AlertTriangle,
      title: "Report bad behaviour",
      body: "Fake profiles, harassment, or inappropriate photos? Use Report on the swipe card. We review every report.",
    },
    {
      icon: Shield,
      title: "Never send money or gifts",
      body: "Anyone asking for money, gift cards, or “help with an emergency” is a scam. Report and block immediately.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-rose-500" />
          <h1 className="text-2xl font-bold">Safety Tips</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8">
          Built for real connections in Windsor — not for scams or creeps.
        </p>

        <div className="space-y-4">
          {tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{tip.title}</h2>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {tip.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-2xl border border-slate-800 bg-slate-900/50 text-center">
          <p className="text-sm text-slate-400">
            In an emergency, call{" "}
            <span className="text-white font-medium">911</span>.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            For non-emergency support in Windsor-Essex, contact local resources
            or the police non-emergency line.
          </p>
        </div>
      </div>
    </div>
  );
}