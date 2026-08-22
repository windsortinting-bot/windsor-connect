"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";

const TEMPLATES = [
  "Hey — your profile stood out. Want to swap favourite local coffee spots?",
  "Hi! I’m around Riverside most evenings. Open to a short walk this week?",
  "Enjoyed your bio. If you’re up for it, want to continue this chat over coffee?",
  "Quick question: Walkerville patio or river walk — which are you more into?",
];

export default function MessageTemplatesPage() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

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

        <h1 className="text-3xl font-bold mb-2">Message templates</h1>
        <p className="text-slate-500 text-sm mb-8">
          Ready-to-copy first messages
        </p>

        <div className="space-y-3">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => copy(t)}
              className="w-full text-left bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4"
            >
              <p className="text-sm text-slate-800">{t}</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                {copied === t ? (
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