"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { inviteShareText, profileShareText } from "../../lib/shareProfile";
import AppShell from "../components/AppShell";

export default function SharePage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [text, setText] = useState(inviteShareText());
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
        .select("first_name, neighborhood")
        .eq("id", account.userId)
        .maybeSingle();
      setText(
        `${profileShareText(data?.first_name || "me", data?.neighborhood)}\n${inviteShareText()}`
      );
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
    <AppShell title="Invite Windsor" onBack={() => router.push("/invite")}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-32 bg-white border border-slate-200 rounded-xl p-3 text-sm"
      />
      <button
        type="button"
        onClick={copy}
        className="w-full mt-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Copy invite
      </button>
      {copied && <p className="text-sm text-emerald-700 mt-3">Copied</p>}
    </AppShell>
  );
}