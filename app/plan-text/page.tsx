"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { loadDateIdeas } from "../../lib/dateIdeas";
import AppShell from "../components/AppShell";

export default function PlanTextPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

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
      const ideas = await loadDateIdeas(data?.neighborhood);
      const idea = ideas[0]?.title || "coffee somewhere public";
      setText(`Want to try this: ${idea}? Daytime, easy to leave if it is not a fit.`);
    };
    run();
  }, [account, loading, router]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AppShell title="Plan text" onBack={() => router.push("/first-date")}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-32 bg-white border border-slate-200 rounded-xl p-3 text-sm"
      />
      <button
        type="button"
        onClick={copy}
        className="w-full mt-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Copy
      </button>
      {copied && <p className="text-sm text-emerald-700 mt-3">Copied</p>}
    </AppShell>
  );
}