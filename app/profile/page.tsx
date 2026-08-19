"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  Heart,
  MapPin,
  Settings,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";

interface ProfileData {
  id: string;
  first_name: string;
  age: number | null;
  gender: string | null;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  height?: string | null;
  kids_status?: string | null;
  kids_preference?: string | null;
  is_paused?: boolean | null;
  is_admin?: boolean | null;
  min_age_pref?: number | null;
  max_age_pref?: number | null;
  target_gender?: string | null;
  prompt_1?: string | null;
  prompt_1_answer?: string | null;
  prompt_2?: string | null;
  prompt_2_answer?: string | null;
  prompt_3?: string | null;
  prompt_3_answer?: string | null;
}

function kidsStatusLabel(status?: string | null) {
  if (status === "have_kids") return "Has kids";
  if (status === "no_kids") return "No kids";
  return null;
}

function kidsPrefLabel(pref?: string | null) {
  if (pref === "want") return "Wants kids";
  if (pref === "dont_want") return "Doesn't want kids";
  if (pref === "already_have") return "Already has kids";
  if (pref === "open") return "Open to kids";
  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
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

      setProfile(p);

      const { data: matches } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matches) {
        const seen = new Set<string>();
        for (const m of matches) {
          const other = m.user1_id === user.id ? m.user2_id : m.user1_id;
          seen.add(other);
        }
        setMatchCount(seen.size);
      }

      const { data: incoming } = await supabase
        .from("swipes")
        .select("swiper_id")
        .eq("target_id", user.id)
        .eq("action", "like");

      const likerIds = (incoming ?? []).map((s) => s.swiper_id);
      if (likerIds.length > 0) {
        const { data: mySwipes } = await supabase
          .from("swipes")
          .select("target_id")
          .eq("swiper_id", user.id);
        const already = new Set((mySwipes ?? []).map((s) => s.target_id));
        setLikeCount(likerIds.filter((id) => !already.has(id)).length);
      } else {
        setLikeCount(0);
      }

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-28">
        <p className="text-slate-300">Profile not found.</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="mt-4 bg-rose-500 text-white px-6 py-3 rounded-xl text-sm"
        >
          Complete profile
        </button>
      </div>
    );
  }

  const photos =
    profile.photo_urls && profile.photo_urls.length > 0
      ? profile.photo_urls
      : [];

  const statusLabel = kidsStatusLabel(profile.kids_status);
  const prefLabel = kidsPrefLabel(profile.kids_preference);

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
  ].filter(Boolean) as { q: string | null | undefined; a: string }[];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            onClick={() => router.push("/settings")}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {profile.is_paused && (
          <div className="mb-4 flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <Pause className="w-4 h-4" />
            Your profile is paused — you’re hidden from discovery.
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-4">
          <div className="relative w-full h-80 bg-slate-800">
            {photos.length > 0 ? (
              <img
                src={photos[photoIndex]}
                alt={profile.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-slate-600" />
              </div>
            )}

            {photos.length > 1 && (
              <>
                <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {photos.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${
                        i === photoIndex ? "w-6 bg-white" : "w-4 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
                  onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
                  onClick={() =>
                    setPhotoIndex((p) => Math.min(photos.length - 1, p + 1))
                  }
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">
                {profile.first_name}
                {profile.age ? `, ${profile.age}` : ""}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              {profile.height && (
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                  {profile.height}
                </span>
              )}
              {statusLabel && (
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                  {statusLabel}
                </span>
              )}
              {prefLabel && (
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                  {prefLabel}
                </span>
              )}
            </div>

            {profile.neighborhood && (
              <div className="flex items-center gap-1 text-rose-400 text-sm mb-3">
                <MapPin className="w-4 h-4" />
                {profile.neighborhood}
              </div>
            )}

            {profile.bio && (
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                {profile.bio}
              </p>
            )}

            {(profile.min_age_pref || profile.max_age_pref) && (
              <p className="text-xs text-slate-500 mb-3">
                Looking for ages {profile.min_age_pref ?? 18}–
                {profile.max_age_pref ?? 99}
                {profile.target_gender && profile.target_gender !== "everyone"
                  ? ` · ${profile.target_gender}`
                  : ""}
              </p>
            )}

            {prompts.length > 0 && (
              <div className="space-y-2 mt-2">
                {prompts.map((p, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/60 rounded-xl px-3 py-2.5"
                  >
                    <p className="text-[11px] text-slate-500 mb-0.5">{p.q}</p>
                    <p className="text-sm text-slate-200">{p.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{matchCount}</p>
            <p className="text-xs text-slate-500 mt-1">Matches</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{likeCount}</p>
            <p className="text-xs text-slate-500 mt-1">Pending likes</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl"
          >
            <Pencil className="w-4 h-4" />
            Edit profile
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl text-sm"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          {profile.is_admin && (
            <button
              onClick={() => router.push("/admin/reports")}
              className="w-full bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 py-3 rounded-xl text-sm"
            >
              Admin reports
            </button>
          )}
        </div>
      </div>
    </div>
  );
}