"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "../../../lib/useAccount";
import { muteMatch } from "../../../lib/mutes";
import AppShell from "../../components/AppShell";

export default function MuteMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { account, loading } = useAccount();
  const matchId = String(params.matchId || "");
  const [status, setStatus] = useState("");

  const save = async () => {
    if (!account) {
      router.push("/auth");
      return;
    }
    try {
      await muteMatch(account.userId, matchId);
      setStatus("Muted. You can unmute later from /muted.");
    } catch (err: any) {
      setStatus(err?.message || "Could not mute");
    }
  };

  return (
    <AppShell title="Mute chat" onBack={() => router.push(`/chat/${matchId}`)}>
      <p className="text-sm text-slate-600 mb-4">
        Mute hides this conversation from your focus list later. Chat history stays.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={save}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Mute this match
      </button>
      {status && <p className="text-sm mt-3">{status}</p>}
    </AppShell>
  );
}