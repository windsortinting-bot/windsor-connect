"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { LogOut, Edit } from "lucide-react";
import AuthGuard from "../components/AuthGuard";

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

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
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
            {profile?.photo_urls?.[0] ? (
              <img
                src={profile.photo_urls[0]}
                alt={profile.first_name}
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 bg-slate-800 flex items-center justify-center">
                <p className="text-slate-500">No photo</p>
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold">
                {profile?.first_name}
                {profile?.age ? `, ${profile.age}` : ""}
              </h2>
              <p className="text-rose-400 text-sm mt-1">
                {profile?.neighborhood || "Windsor"}
              </p>
              {profile?.bio && (
                <p className="text-slate-300 mt-4 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/onboarding")}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}