"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { freshnessLabel } from "../../lib/freshness";
import AppShell from "../components/AppShell";

export default function FreshnessPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [label, setLabel] = useState("...");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("last_active_at")
        .eq("id", account.userId)
        .maybeSingle();
      setLabel(freshnessLabel(data?.last_active_at));
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Activity" onBack={() => router.push("/active")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-sm text-slate-500">Your activity looks like</p>
        <p className="text-2xl font-bold mt-2">{label}</p>
        <p className="text-sm text-slate-600 mt-3">
          Open the app and swipe or chat so people see you as present.
        </p>
      </div>
    </AppShell>
  );
}