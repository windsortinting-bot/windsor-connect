"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadBioPrompts } from "../../lib/bioPrompts";
import AppShell from "../components/AppShell";

export default function BioHelpPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const run = async () => {
      setPrompts(await loadBioPrompts());
    };
    run();
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch {
      setCopied("Could not copy");
    }
  };

  return (
    <AppShell title="Bio help" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4">
        Copy a prompt, then finish it on your profile.
      </p>
      <div className="space-y-3">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => copy(p)}
            className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 text-sm"
          >
            {p}
          </button>
        ))}
      </div>
      {copied && <p className="text-xs text-emerald-600 mt-4">Copied: {copied}</p>}
    </AppShell>
  );
}