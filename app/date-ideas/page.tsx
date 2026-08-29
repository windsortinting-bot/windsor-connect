"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { loadDateIdeas, type DateIdea } from "../../lib/dateIdeas";
import AppShell from "../components/AppShell";

export default function DateIdeasPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [ideas, setIdeas] = useState<DateIdea[]>([]);
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
      const rows = await loadDateIdeas(data?.neighborhood);
      setIdeas(rows);
    };
    run();
  }, [account, loading, router]);

  const copy = async (title: string) => {
    try {
      await navigator.clipboard.writeText(`Want to try this: ${title}?`);
      setCopied(title);
    } catch {
      setCopied("Could not copy");
    }
  };

  return (
    <AppShell title="Date ideas" onBack={() => router.push("/matches")}>
      <p className="text-sm text-slate-600 mb-4">
        Copy one and send it in chat.
      </p>
      <div className="space-y-3">
        {ideas.map((idea) => (
          <button
            key={idea.id}
            type="button"
            onClick={() => copy(idea.title)}
            className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4"
          >
            <p className="font-medium">{idea.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              {idea.neighborhood || "Windsor"} · {idea.cost || "low"}
            </p>
          </button>
        ))}
      </div>
      {copied && <p className="text-xs text-emerald-600 mt-4">Copied: {copied}</p>}
    </AppShell>
  );
}