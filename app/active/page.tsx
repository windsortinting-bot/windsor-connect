"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getAccountState } from "../../lib/session";
import { pingActive } from "../../lib/heartbeat";
import { timeAgo } from "../../lib/format";
import AppShell from "../components/AppShell";

export default function ActivePage() {
  const router = useRouter();
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const account = await getAccountState();
      if (!account) {
        router.push("/auth");
        return;
      }
      await pingActive(account.userId);
      const { data } = await supabase
        .from("profiles")
        .select("last_active_at")
        .eq("id", account.userId)
        .single();
      setLastActive(data?.last_active_at || null);
      setLoading(false);
    };
    run();
  }, [router]);

  return (
    <AppShell title="Activity" onBack={() => router.push("/settings")}>
      {loading ? (
        <p className="text-sm text-slate-500">Checking...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-sm text-slate-600">
            Last active: {lastActive ? timeAgo(lastActive) : "just updated"}
          </p>
          <p className="text-xs text-slate-400 mt-3">
            The app now records activity so discovery can prefer people who are
            actually around.
          </p>
        </div>
      )}
    </AppShell>
  );
}