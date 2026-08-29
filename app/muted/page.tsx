"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { listMutedMatchIds, unmuteMatch } from "../../lib/mutes";
import AppShell from "../components/AppShell";

export default function MutedPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [ids, setIds] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const load = async (userId: string) => {
    const data = await listMutedMatchIds(userId);
    setIds(data);
  };

  useEffect(() => {
    if (loading) return;
    if (!account) {
      router.push("/auth");
      return;
    }
    load(account.userId);
  }, [account, loading, router]);

  const unmute = async (matchId: string) => {
    if (!account) return;
    await unmuteMatch(account.userId, matchId);
    setStatus("Unmuted");
    load(account.userId);
  };

  return (
    <AppShell title="Muted chats" onBack={() => router.push("/messages")}>
      {ids.length === 0 ? (
        <p className="text-sm text-slate-500">No muted conversations.</p>
      ) : (
        <div className="space-y-2">
          {ids.map((id) => (
            <div key={id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <p className="text-xs break-all">{id}</p>
              <button
                type="button"
                onClick={() => unmute(id)}
                className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg"
              >
                Unmute
              </button>
            </div>
          ))}
        </div>
      )}
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
    </AppShell>
  );
}