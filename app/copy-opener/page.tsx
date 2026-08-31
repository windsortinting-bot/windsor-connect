"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const OPENERS = [
  "Walkerville or Riverside for a first coffee?",
  "What is your go-to Windsor spot on a weeknight?",
  "If we meet this week, coffee or a walk by the river?",
];

export default function CopyOpenerPage() {
  const router = useRouter();
  const [copied, setCopied] = useState("");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch {
      setCopied("");
    }
  };

  return (
    <AppShell title="Copy an opener" onBack={() => router.push("/messages")}>
      <div className="space-y-2">
        {OPENERS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => copy(text)}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left text-sm"
          >
            {text}
          </button>
        ))}
      </div>
      {copied && <p className="text-sm text-emerald-700 mt-4">Copied.</p>}
    </AppShell>
  );
}
