"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Settings,
  Shield,
  User,
} from "lucide-react";

interface Profile {
  id: string;
  first_name: string | null;
  age: number | null;
  bio: string | null;
  neighborhood: string | null;
  photo_urls: string[] | null;
  height: string | null;
  kids_status: string | null;
  kids_preference: string | null;
  prompt_1: string | null;
  prompt_1_answer: string | null;
  prompt_2: string | null;
  prompt_2_answer: string | null;
  prompt_3: string | null;
  prompt_3_answer: string | null;
  is_admin: boolean | null;
  is_paused: boolean | null;
}

export default function ProfileHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", user.id);

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(p as Profile);

      const { count: matches } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const { count: likes } = await supabase
        .from("swipes")
        .select("*", { count: "exact", head: true })
        .eq("target_id", user.id)
        .eq("action", "like");

      setMatchCount(matches ?? 0);
      setLikeCount(likes ?? 0);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p>Profile not found.</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="mt-4 bg-rose-500 px-6 py-3 rounded-xl text-sm"
        >
          Complete profile
        </button>
      </div>
    );
  }

  const photos = profile.photo_urls || [];
  const prompts = [
    profile.prompt_1_answer
      ? { q: profile.prompt_1, a: profile.prompt_1_answer }
      : null,
    profile.prompt_2_answer
      ? { q: profile.prompt_2, a: profile.prompt_2_answer }
      : null,
    profile.prompt_3_answer
      ? { q: profile.prompt_3, a: profile.prompt_3_answer }
      : null,
  ].filter(Boolean) as { q: string | null; a: string }[];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {profile.is_paused && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm rounded-xl px-4 py-3">
            Your profile is paused — you’re hidden from discovery.
          </div>
        )}

        <div className="relative w-full h-72 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 mb-4">
          {photos.length > 0 ? (
            <img
              src={photos[photoIndex]}
              alt={profile.first_name || "You"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-12 h-12 text-slate-600" />
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPhotoIndex((p) => Math.min(photos.length - 1, p + 1))
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold">
          {profile.first_name}
          {profile.age ? `, ${profile.age}` : ""}
        </h2>
        {profile.neighborhood && (
          <p className="text-rose-400 text-sm mt-1">{profile.neighborhood}</p>
        )}

        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold">{matchCount}</p>
            <p className="text-xs text-slate-500 mt-1">Matches</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold">{likeCount}</p>
            <p className="text-xs text-slate-500 mt-1">Likes received</p>
          </div>
        </div>

        {(profile.height || profile.kids_status || profile.kids_preference) && (
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {profile.height && (
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                {profile.height}
              </span>
            )}
            {profile.kids_status === "have_kids" && (
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                Has kids
              </span>
            )}
            {profile.kids_preference === "want" && (
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                Wants kids
              </span>
            )}
            {profile.kids_preference === "dont_want" && (
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                Doesn’t want kids
              </span>
            )}
          </div>
        )}

        {profile.bio && (
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {profile.bio}
          </p>
        )}

        {prompts.length > 0 && (
          <div className="space-y-2 mb-6">
            {prompts.map((p, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3">
                <p className="text-[11px] text-slate-500 mb-1">{p.q}</p>
                <p className="text-sm text-slate-200">{p.a}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl"
          >
            Edit profile
          </button>
          <button
            onClick={() => router.push("/filters")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 py-3 rounded-xl text-sm"
          >
            Discovery filters
          </button>
          <button
            onClick={() => router.push("/activity")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            Activity
          </button>
          <button
            onClick={() => router.push("/safety")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            Safety
          </button>
          {profile.is_admin && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-slate-800 py-3 rounded-xl text-sm"
            >
              Admin dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}