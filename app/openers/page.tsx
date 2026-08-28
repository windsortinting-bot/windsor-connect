"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { loadStarters } from "../../lib/starters";
import AppShell from "../components/AppShell";

export default function OpenersPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("neighborhood")
        .eq("id", account.userId)
        .maybeSingle();
      const list = await loadStarters(data?.neighborhood);
      setPrompts(list);
    };
    run();
  }, [account, loading, router]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch {
      setCopied("Could not copy");
    }
  };

  return (
    <AppShell title="Openers" onBack={() => router.push("/messages")}>
      <p className="text-sm text-slate-600 mb-4">
        Copy one of these into chat instead of “hey”.
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