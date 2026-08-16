"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { LogOut, Edit, MapPin, Heart } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

    // Delete related data
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

    // Sign out
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

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10 pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
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

        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {profile?.photo_urls?.[0] ? (
            <img
              src={profile.photo_urls[0]}
              alt={profile.first_name}
              className="w-full h-80 object-cover"
            />
          ) : (
            <div className="w-full h-80 bg-slate-800 flex items-center justify-center">
              <Heart className="w-16 h-16 text-slate-600" />
            </div>
          )}

          <div className="p-6">
            <h2 className="text-2xl font-bold">
              {profile?.first_name}
              {profile?.age ? `, ${profile.age}` : ""}
            </h2>

            <div className="flex items-center gap-1 text-rose-400 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {profile?.neighborhood || profile?.city || "Windsor"}
            </div>

            {profile?.gender && (
              <p className="text-slate-400 text-sm mt-3 capitalize">
                {profile.gender}
                {profile.target_gender
                  ? ` · Looking for ${profile.target_gender}`
                  : ""}
              </p>
            )}

            {profile?.bio && (
              <p className="text-slate-300 mt-4 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl transition-all"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>

        {/* Delete Account */}
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