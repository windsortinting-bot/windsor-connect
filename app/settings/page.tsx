"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ArrowLeft,
  Pause,
  Play,
  LogOut,
  Trash2,
  Shield,
  Share2,
  Bell,
  Ban,
  SlidersHorizontal,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [message, setMessage] = useState("");

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

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "is_paused, notify_matches, notify_messages, notify_likes"
        )
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsPaused(profile.is_paused ?? false);
        setNotifyMatches(profile.notify_matches ?? true);
        setNotifyMessages(profile.notify_messages ?? true);
        setNotifyLikes(profile.notify_likes ?? true);
      }

      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", user.id);

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
      setMessage(error.message);
    } else {
      setIsPaused(next);
      setMessage(
        next ? "Profile paused — you’re hidden." : "Profile is live again."
      );
    }
    setSaving(false);
  };

  const saveNotify = async (
    field: "notify_matches" | "notify_messages" | "notify_likes",
    value: boolean
  ) => {
    if (!userId) return;
    await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", userId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleDelete = async () => {
    if (!userId) return;
    const ok = confirm(
      "Delete your account permanently? This cannot be undone."
    );
    if (!ok) return;

    const confirmText = prompt("Type DELETE to confirm:");
    if (confirmText !== "DELETE") {
      alert("Cancelled.");
      return;
    }

    await supabase.from("messages").delete().eq("sender_id", userId);
    await supabase.from("swipes").delete().eq("swiper_id", userId);
    await supabase.from("swipes").delete().eq("target_id", userId);
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
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profile
        </button>

        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-500 text-sm mb-8">
          Control your Windsor Connect experience
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {isPaused ? (
                <Pause className="w-5 h-5 text-amber-400 mt-0.5" />
              ) : (
                <Play className="w-5 h-5 text-emerald-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {isPaused ? "Profile paused" : "Profile active"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {isPaused
                    ? "You’re hidden from swipe and likes."
                    : "Others can see and match with you."}
                </p>
              </div>
            </div>
            <button
              onClick={togglePause}
              disabled={saving}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                isPaused
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
            >
              {isPaused ? "Unpause" : "Pause"}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-rose-400" />
            <p className="font-semibold">Notifications</p>
          </div>

          {[
            {
              label: "New matches",
              value: notifyMatches,
              set: setNotifyMatches,
              field: "notify_matches" as const,
            },
            {
              label: "New messages",
              value: notifyMessages,
              set: setNotifyMessages,
              field: "notify_messages" as const,
            },
            {
              label: "New likes",
              value: notifyLikes,
              set: setNotifyLikes,
              field: "notify_likes" as const,
            },
          ].map((item) => (
            <label
              key={item.field}
              className="flex items-center justify-between py-3 border-t border-slate-800 first:border-0"
            >
              <span className="text-sm text-slate-300">{item.label}</span>
              <input
                type="checkbox"
                checked={item.value}
                onChange={async (e) => {
                  item.set(e.target.checked);
                  await saveNotify(item.field, e.target.checked);
                }}
                className="w-5 h-5 accent-rose-500"
              />
            </label>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          <button
            onClick={() => router.push("/filters")}
            className="w-full text-left bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            Discovery filters
          </button>
          <button
            onClick={() => router.push("/blocked")}
            className="w-full text-left bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          >
            <Ban className="w-4 h-4 text-rose-400" />
            Blocked users
          </button>
          <button
            onClick={() => router.push("/invite")}
            className="w-full text-left bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 text-rose-400" />
            Invite friends
          </button>
          <button
            onClick={() => router.push("/safety")}
            className="w-full text-left bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            Safety tips
          </button>
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full text-left bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm"
          >
            Edit profile
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm mb-3"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>

        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 rounded-xl py-3 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete account
        </button>
      </div>
    </div>
  );
}