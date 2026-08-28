"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { loadInbox, type InboxThread } from "../../lib/inbox";
import SafeImage from "../components/SafeImage";
import AppShell from "../components/AppShell";
import PageStatus from "../components/PageStatus";

export default function InboxLitePage() {
  const router = useRouter();
  const { account, loading: accountLoading } = useAccount();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (accountLoading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      try {
        const data = await loadInbox(account.userId);
        setThreads(data);
      } catch (err: any) {
        setError(err?.message || "Could not load inbox");
      }
      setLoading(false);
    };
    run();
  }, [account, accountLoading, router]);

  return (
    <AppShell title="Inbox" onBack={() => router.push("/messages")}>
      <PageStatus
        loading={accountLoading || loading}
        error={error}
        empty={!loading && !error && threads.length === 0 ? "No conversations yet." : undefined}
      >
        <div className="space-y-2">
          {threads.map((t) => (
            <button
              key={t.matchId}
              type="button"
              onClick={() => router.push(`/chat/${t.matchId}`)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 text-left"
            >
              <SafeImage
                urls={t.photo ? [t.photo] : []}
                alt={t.otherName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="font-semibold truncate">{t.otherName}</p>
                <p className="text-sm text-slate-500 truncate">
                  {t.lastMessage || "Say hello"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PageStatus>
    </AppShell>
  );
}