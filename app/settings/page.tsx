"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ArrowLeft,
  Pause,
  Play,
  Shield,
  LogOut,
  Trash2,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("is_paused")
        .eq("id", user.id)
        .single();

      setIsPaused(data?.is_paused ?? false);
      setLoading(false);
    };

    load();
  }, [router]);

  const togglePause = async () => {
    if (!userId) return;
    setSaving(true);

    const next = !isPaused;
    const { error } = await supabase
      .from("profiles")
      .update({ is_paused: next })
      .eq("id", userId);

    if (error) {
      alert("Could not update. Try again.");
    } else {
      setIsPaused(next);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Are you sure?"))
      return;
    if (!confirm("Really delete everything? This cannot be undone.")) return;
    if (!userId) return;

    await supabase
      .from("swipes")
      .delete()
      .or(`swiper_id.eq.${userId},target_id.eq.${userId}`);
    await supabase
      .from("matches")
      .delete()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    await supabase
      .from("blocks")
      .delete()
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
    await supabase.from("profiles").delete().eq("id", userId);
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
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Pause profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                {isPaused ? (
                  <Play className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Pause className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {isPaused ? "Profile paused" : "Pause profile"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {isPaused
                    ? "You’re hidden from swipe. Unpause to appear again."
                    : "Hide yourself from discovery without deleting your account."}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={togglePause}
            disabled={saving}
            className={`w-full mt-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isPaused
                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
            }`}
          >
            {saving
              ? "Saving..."
              : isPaused
              ? "Unpause profile"
              : "Pause profile"}
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl px-5 py-4 text-left"
          >
            <User className="w-5 h-5 text-slate-400" />
            <span>Edit profile</span>
          </button>

          <button
            onClick={() => router.push("/safety")}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl px-5 py-4 text-left"
          >
            <Shield className="w-5 h-5 text-slate-400" />
            <span>Safety tips</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl px-5 py-4 text-left"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span>Log out</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-rose-950/40 rounded-2xl px-5 py-4 text-left text-rose-400"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete account</span>
          </button>
        </div>
      </div>
    </div>
  );
}