"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { photoHealth } from "../../lib/photoHealth";
import SafeImage from "../components/SafeImage";
import AppShell from "../components/AppShell";

export default function PhotoCheckPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [urls, setUrls] = useState<string[]>([]);
  const [note, setNote] = useState("");
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
        .select("photo_urls")
        .eq("id", account.userId)
        .maybeSingle();
      const health = photoHealth(data?.photo_urls);
      setUrls(Array.isArray(data?.photo_urls) ? data.photo_urls : []);
      setNote(health.note);
      setScore(health.score);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Photo check" onBack={() => router.push("/profile")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <p className="text-sm text-slate-500">Photo score</p>
        <p className="text-3xl font-bold text-rose-500">{score}</p>
        <p className="text-sm text-slate-600 mt-2">{note}</p>
      </div>
      <SafeImage
        urls={urls}
        alt="Your photo"
        className="w-full h-64 object-cover rounded-2xl"
      />
      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="w-full mt-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Update photos
      </button>
    </AppShell>
  );
}