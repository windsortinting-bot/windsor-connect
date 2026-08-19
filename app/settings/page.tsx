"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ArrowLeft,
  Ban,
  LogOut,
  Pause,
  Play,
  Shield,
  Trash2,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);

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

      const { data: p } = await supabase
        .from("profiles")
        .select(
          "is_paused, notify_matches, notify_messages, notify_likes"
        )
        .eq("id", user.id)
        .single();

      if (p) {
        setIsPaused(!!p.is_paused);
        setNotifyMatches(p.notify_matches ?? true);
        setNotifyMessages(p.notify_messages ?? true);
        setNotifyLikes(p.notify_likes ?? true);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const savePrefs = async (patch: Record<string, boolean>) => {
    if (!userId) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId);
    if (error) setMessage(error.message);
    else setMessage("Saved");
    setSaving(false);
  };

  const togglePause = async () => {
    const next = !isPaused;
    setIsPaused(next);
    await savePrefs({ is_paused: next });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete your Windsor Connect account and all app data? This cannot be undone."
      )
    ) {
      return;
    }
    if (!confirm("Type OK in your head — last chance. Delete forever?")) {
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-500 text-sm mb-8">Account & privacy</p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isPaused ? (
                <Pause className="w-5 h-5 text-amber-400" />
              ) : (
                <Play className="w-5 h-5 text-emerald-400" />
              )}
              <div>
                <p className="font-medium">Pause profile</p>
                <p className="text-xs text-slate-500">
                  Hide from discovery without deleting
                </p>
              </div>
            </div>
            <button
              onClick={togglePause}
              disabled={saving}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                isPaused
                  ? "border-amber-500/40 text-amber-300"
                  : "border-slate-600 text-slate-300"
              }`}
            >
              {isPaused ? "Paused" : "Active"}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-4">
          <p className="text-sm text-slate-400">Notification preferences</p>
          {[
            {
              label: "New matches",
              value: notifyMatches,
              set: setNotifyMatches,
              key: "notify_matches",
            },
            {
              label: "Messages",
              value: notifyMessages,
              set: setNotifyMessages,
              key: "notify_messages",
            },
            {
              label: "Likes",
              value: notifyLikes,
              set: setNotifyLikes,
              key: "notify_likes",
            },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <span className="text-sm text-slate-200">{row.label}</span>
              <button
                onClick={async () => {
                  const next = !row.value;
                  row.set(next);
                  await savePrefs({ [row.key]: next });
                }}
                className={`w-12 h-7 rounded-full relative transition-colors ${
                  row.value ? "bg-rose-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${
                    row.value ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm"
          >
            <User className="w-4 h-4 text-rose-400" />
            Edit profile
          </button>
          <button
            onClick={() => router.push("/filters")}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            Discovery filters
          </button>
          <button
            onClick={() => router.push("/blocked")}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm"
          >
            <Ban className="w-4 h-4 text-rose-400" />
            Blocked users
          </button>
          <button
            onClick={() => router.push("/safety")}
            className="w-full flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-3 text-sm"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            Safety tips
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
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 rounded-xl py-3 text-sm disabled:opacity-60"
        >
          <Trash2 className="w-4 h-4" />
          Delete account
        </button>
      </div>
    </div>
  );
}