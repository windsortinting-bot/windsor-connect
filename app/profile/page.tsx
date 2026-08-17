"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  LogOut,
  Edit,
  MapPin,
  Heart,
  Shield,
  AlertTriangle,
  Settings,
  Share2,
} from "lucide-react";

function kidsStatusLabel(status?: string | null) {
  if (status === "have_kids") return "Has kids";
  if (status === "no_kids") return "No kids";
  return "Kids: prefer not to say";
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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Are you sure?"))
      return;
    if (!confirm("Really delete everything? This cannot be undone.")) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("swipes")
      .delete()
      .or(`swiper_id.eq.${user.id},target_id.eq.${user.id}`);
    await supabase
      .from("matches")
      .delete()
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    await supabase
      .from("blocks")
      .delete()
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
    await supabase.from("profiles").delete().eq("id", user.id);

    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p>Profile not found</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="mt-4 text-rose-400"
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

  const pref = kidsPrefLabel(profile.kids_preference);

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
  ].filter(Boolean) as { q: string; a: string }[];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

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
                <Heart className="w-16 h-16 text-slate-600" />
              </div>
            )}

            {photos.length > 1 && (
              <>
                <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {photos.map((_: string, i: number) => (
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
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                  onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                  onClick={() =>
                    setPhotoIndex((p) => Math.min(photos.length - 1, p + 1))
                  }
                />
              </>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold">
              {profile.first_name}
              {profile.age ? `, ${profile.age}` : ""}
            </h2>

            <div className="flex items-center gap-1 text-rose-400 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {profile.neighborhood || profile.city || "Windsor"}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {profile.height && (
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                  {profile.height}
                </span>
              )}
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                {kidsStatusLabel(profile.kids_status)}
              </span>
              {pref && (
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                  {pref}
                </span>
              )}
            </div>

            {profile.gender && (
              <p className="text-slate-400 text-sm mt-3 capitalize">
                {profile.gender}
                {profile.target_gender
                  ? ` · Looking for ${profile.target_gender}`
                  : ""}
              </p>
            )}

            {(profile.min_age_pref || profile.max_age_pref) && (
              <p className="text-slate-500 text-sm mt-1">
                Ages {profile.min_age_pref ?? 18}–{profile.max_age_pref ?? 99}
              </p>
            )}

            {profile.bio && (
              <p className="text-slate-300 mt-4 leading-relaxed">{profile.bio}</p>
            )}

            {prompts.length > 0 && (
              <div className="space-y-2 mt-5">
                {prompts.map((p, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-xl px-3 py-2.5">
                    <p className="text-[11px] text-slate-500 mb-0.5">{p.q}</p>
                    <p className="text-sm text-slate-200">{p.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl transition-all"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>

        <button
          onClick={() => router.push("/settings")}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 py-3.5 rounded-xl transition-all text-sm"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        <button
          onClick={() => router.push("/invite")}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 py-3.5 rounded-xl transition-all text-sm"
        >
          <Share2 className="w-4 h-4" />
          Invite friends
        </button>

        <button
          onClick={() => router.push("/safety")}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 py-3.5 rounded-xl transition-all text-sm"
        >
          <Shield className="w-4 h-4" />
          Safety Tips
        </button>

        {profile.is_admin && (
          <button
            onClick={() => router.push("/admin/reports")}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-900 border border-rose-900/50 hover:bg-slate-800 text-rose-400 py-3.5 rounded-xl transition-all text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Admin · Reports
          </button>
        )}

        <button
          onClick={handleDeleteAccount}
          className="w-full mt-3 text-sm text-slate-500 hover:text-rose-500 py-2"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}