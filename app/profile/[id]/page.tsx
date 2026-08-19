"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
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
  is_banned: boolean | null;
  is_paused: boolean | null;
  is_onboarded: boolean | null;
}

function kidsStatusLabel(status?: string | null) {
  if (status === "have_kids") return "Has kids";
  if (status === "no_kids") return "No kids";
  return null;
}

function kidsPrefLabel(pref?: string | null) {
  if (pref === "want") return "Wants kids";
  if (pref === "dont_want") return "Doesn’t want kids";
  if (pref === "already_have") return "Already has kids";
  if (pref === "open") return "Open to kids";
  return null;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setViewerId(user.id);

      if (user.id === profileId) {
        router.replace("/profile");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error || !data || data.is_banned || !data.is_onboarded) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
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

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
        <p className="text-slate-300 mb-4">Profile not available</p>
        <button
          onClick={() => router.back()}
          className="bg-slate-800 px-6 py-3 rounded-xl text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const photos = profile.photo_urls || [];
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
  ].filter(Boolean) as { q: string | null; a: string }[];

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

        <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 mb-4">
          {photos.length > 0 ? (
            <img
              src={photos[photoIndex]}
              alt={profile.first_name || "Profile"}
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

        <h1 className="text-3xl font-bold">
          {profile.first_name}
          {profile.age ? `, ${profile.age}` : ""}
        </h1>

        {profile.neighborhood && (
          <div className="flex items-center gap-1 text-rose-400 text-sm mt-1 mb-3">
            <MapPin className="w-4 h-4" />
            {profile.neighborhood}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4 text-xs">
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

        {profile.bio && (
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {profile.bio}
          </p>
        )}

        {prompts.length > 0 && (
          <div className="space-y-2 mb-6">
            {prompts.map((p, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3"
              >
                <p className="text-[11px] text-slate-500 mb-1">{p.q}</p>
                <p className="text-sm text-slate-200">{p.a}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push("/likes")}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
        >
          <Heart className="w-4 h-4 text-rose-400" />
          Back to discovery
        </button>
      </div>
    </div>
  );
}