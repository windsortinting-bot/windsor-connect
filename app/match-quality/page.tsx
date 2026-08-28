"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { matchQuality } from "../../lib/matchQuality";
import AppShell from "../components/AppShell";

export default function MatchQualityPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("neighborhood, bio, photo_urls, last_active_at")
        .eq("id", account.userId)
        .maybeSingle();

      const hours = data?.last_active_at
        ? (Date.now() - new Date(data.last_active_at).getTime()) / 36e5
        : null;

      setScore(
        matchQuality({
          sameNeighborhood: true,
          bothHavePhotos: Array.isArray(data?.photo_urls) && data.photo_urls.length > 0,
          bothHaveBios: !!data?.bio,
          lastActiveHours: hours,
        })
      );
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Match strength" onBack={() => router.push("/profile")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-sm text-slate-500">Your current strength</p>
        <p className="text-4xl font-bold text-rose-500 mt-2">{score ?? "..."}</p>
        <p className="text-sm text-slate-600 mt-3">
          Photos, bio, neighborhood, and recent activity raise this score.
        </p>
      </div>
    </AppShell>
  );
}