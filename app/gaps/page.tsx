"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { profileCompleteness } from "../../lib/completeness";
import AppShell from "../components/AppShell";

export default function GapsPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [missing, setMissing] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name, age, bio, photo_urls, neighborhood")
        .eq("id", account.userId)
        .maybeSingle();
      const result = profileCompleteness(data || {});
      setMissing(result.missing);
      setScore(result.score);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Profile gaps" onBack={() => router.push("/self-preview")}>
      <p className="text-3xl font-bold text-rose-500 mb-4">{score}%</p>
      {missing.length === 0 ? (
        <p className="text-sm text-slate-600">Your basics are filled in.</p>
      ) : (
        <div className="space-y-2">
          {missing.map((item) => (
            <div key={item} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
              Missing: {item}
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="w-full mt-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Edit profile
      </button>
    </AppShell>
  );
}