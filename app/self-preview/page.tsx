"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import { photoHealth } from "../../lib/photoHealth";
import { profileCompleteness } from "../../lib/completeness";
import SafeImage from "../components/SafeImage";
import AppShell from "../components/AppShell";

export default function SelfPreviewPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name, age, neighborhood, bio, photo_urls")
        .eq("id", account.userId)
        .maybeSingle();
      setProfile(data);
    };
    run();
  }, [account, loading, router]);

  const health = photoHealth(profile?.photo_urls);
  const complete = profile ? profileCompleteness(profile) : null;

  return (
    <AppShell title="How you look" onBack={() => router.push("/profile")}>
      <SafeImage
        urls={profile?.photo_urls}
        alt={profile?.first_name || "You"}
        className="w-full h-72 object-cover rounded-2xl mb-4"
      />
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <p className="text-xl font-bold">
          {profile?.first_name || "You"}
          {profile?.age ? `, ${profile.age}` : ""}
        </p>
        <p className="text-sm text-rose-500 mt-1">{profile?.neighborhood || "Windsor"}</p>
        <p className="text-sm text-slate-600 mt-3">{profile?.bio || "Add a bio so people have something to answer."}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <p className="text-xs text-slate-500">Photo score</p>
          <p className="text-2xl font-bold">{health.score}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <p className="text-xs text-slate-500">Profile score</p>
          <p className="text-2xl font-bold">{complete?.score ?? 0}</p>
        </div>
      </div>
    </AppShell>
  );
}