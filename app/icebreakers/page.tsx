"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { ICEBREAKERS } from "../../lib/constants";

export default function IcebreakersPage() {
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
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Icebreakers</h1>
        <p className="text-slate-500 text-sm mb-8">
          Copy a line and paste it into a new match chat
        </p>

        <div className="space-y-3">
          {ICEBREAKERS.map((line) => (
            <button
              key={line}
              onClick={() => copy(line)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4"
            >
              <p className="text-sm text-slate-200 leading-relaxed">{line}</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                {copied === line ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
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