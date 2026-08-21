"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ICEBREAKERS } from "../../lib/constants";
import { ArrowLeft, Copy, Check } from "lucide-react";

const EXTRA = [
  "What’s your favourite hidden gem in Windsor?",
  "Are you more Walkerville coffee or Riverside walks?",
  "What’s one local place you think is underrated?",
  "If we met this week, would daytime or evening work better?",
];

export default function ConversationStartersPage() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const lines = [...ICEBREAKERS, ...EXTRA];

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

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

        <h1 className="text-3xl font-bold mb-2">Conversation starters</h1>
        <p className="text-slate-500 text-sm mb-8">
          Copy a line into a new match chat
        </p>

        <div className="space-y-3">
          {lines.map((line) => (
            <button
              key={line}
              onClick={() => copy(line)}
              className="w-full text-left bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4"
            >
              <p className="text-sm text-slate-800 leading-relaxed">{line}</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                {copied === line ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Tap to copy
                  </>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}