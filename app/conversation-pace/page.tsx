"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TIPS = [
  "Match their energy — don’t double-text five times if they reply once a day.",
  "Ask one real question per message, not a list of interviews.",
  "Suggest a simple plan once the chat feels easy.",
  "It’s okay to slow down or stop if interest isn’t mutual.",
];

export default function ConversationPacePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Conversation pace</h1>
        <p className="text-slate-500 text-sm mb-8">
          Keep chats healthy and low-pressure
        </p>

        <div className="space-y-3">
          {TIPS.map((t) => (
            <div
              key={t}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-700"
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}