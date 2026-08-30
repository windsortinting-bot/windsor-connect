"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { profileCompleteness } from "../../lib/completeness";
import AppShell from "../components/AppShell";

export default function NextBestPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [action, setAction] = useState("Loading...");
  const [href, setHref] = useState("/today");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, age, bio, photo_urls, neighborhood")
        .eq("id", account.userId)
        .maybeSingle();

      const gaps = profileCompleteness(profile || {});
      if (gaps.missing.includes("photo")) {
        setAction("Add a photo first");
        setHref("/photo-check");
        return;
      }
      if (gaps.missing.includes("bio")) {
        setAction("Write a short bio");
        setHref("/bio-help");
        return;
      }

      const { count } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1_id.eq.${account.userId},user2_id.eq.${account.userId}`);

      if ((count || 0) > 0) {
        setAction("Message a match");
        setHref("/after-match");
        return;
      }

      setAction("Start swiping");
      setHref("/swipe");
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Next best step" onBack={() => router.push("/today")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <p className="text-sm text-slate-500">Do this next</p>
        <p className="text-2xl font-bold mt-2">{action}</p>
      </div>
      <button
        type="button"
        onClick={() => router.push(href)}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Go
      </button>
    </AppShell>
  );
}