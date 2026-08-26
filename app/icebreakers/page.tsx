"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const LINES = [
  "Coffee in Walkerville or a river walk — which sounds better this week?",
  "What’s one Windsor spot you take people who are visiting?",
  "Your photos look easygoing. What’s a normal Saturday for you?",
  "I’m trying to get off the app and into a real conversation. Up for that?",
  "If we grab a drink, what’s your no-fail order?",
  "Riverside or downtown for a first hangout?",
];

export default function IcebreakersPage() {
  const router = useRouter();
  const [line, setLine] = useState(LINES[0]);
  const [copied, setCopied] = useState(false);

  const next = () => {
    const pick = LINES[Math.floor(Math.random() * LINES.length)];
    setLine(pick);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/first-match")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          First match guide
        </button>
        <h1 className="text-3xl font-bold mb-2">Icebreakers</h1>
        <p className="text-slate-500 text-sm mb-8">Copy a first message and send it</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
          <p className="text-sm leading-relaxed">{line}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={next}
            className="border border-slate-200 bg-white rounded-xl py-3 text-sm"
          >
            New line
          </button>
          <button
            type="button"
            onClick={copy}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-3 text-sm font-semibold"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}