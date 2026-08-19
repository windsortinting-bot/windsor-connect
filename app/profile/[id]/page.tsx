"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import {
  ArrowLeft,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProfileData {
  id: string;
  first_name: string;
  age: number | null;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  height?: string | null;
  kids_status?: string | null;
  kids_preference?: string | null;
  prompt_1?: string | null;
  prompt_1_answer?: string | null;
  prompt_2?: string | null;
  prompt_2_answer?: string | null;
  prompt_3?: string | null;
  prompt_3_answer?: string | null;
  last_active_at?: string | null;
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

function lastActiveLabel(iso: string | null | undefined) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 15) return "Active now";
  if (mins < 60) return `Active ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Active yesterday";
  if (days < 7) return `Active ${days}d ago`;
  return null;
}

export default function ViewProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Only allow viewing if matched or self
      if (user.id !== profileId) {
        const { data: match } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`
          )
          .maybeSingle();

        if (!match) {
          setNotAllowed(true);
          setLoading(false);
          return;
        }
      }

      const { data: p, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error || !p) {
        setProfile(null);
      } else {
        setProfile(p);
      }
      setLoading(false);
    };

    load();
  }, [profileId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (notAllowed) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
        <p className="text-slate-300">You can only view profiles you matched with.</p>
        <button
          onClick={() => router.push("/matches")}
          className="mt-4 bg-rose-500 text-white px-6 py-3 rounded-xl text-sm"
        >
          Back to Matches
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
        <p className="text-slate-300">Profile not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-slate-800 text-white px-6 py-3 rounded-xl text-sm"
        >
          Go back
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
  const active = lastActiveLabel(profile.last_active_at);

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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
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
            <h2 className="text-2xl font-bold">
              {profile.first_name}
              {profile.age ? `, ${profile.age}` : ""}
            </h2>

            {active && (
              <p className="text-xs text-emerald-400 mt-1">{active}</p>
            )}

            <div className="flex flex-wrap gap-2 my-3 text-xs">
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
      </div>
    </div>
  );
}