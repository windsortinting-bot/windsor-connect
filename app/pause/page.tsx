"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft } from "lucide-react";

export default function PausePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("is_paused, pause_reason")
        .eq("id", user.id)
        .single();

      setPaused(!!data?.is_paused);
      setReason(data?.pause_reason || "");
      setLoading(false);
    };
    load();
  }, [router]);

  const toggle = async () => {
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const next = !paused;
    const { error } = await supabase
      .from("profiles")
      .update({
        is_paused: next,
        pause_reason: next ? reason.trim() || null : null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    await trackEvent(next ? "profile_paused" : "profile_unpaused");
    setPaused(next);
    setMessage(next ? "Profile paused" : "Profile is active again");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Pause profile</h1>
        <p className="text-slate-500 text-sm mb-8">
          Hide yourself from discovery without deleting your account
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-sm text-slate-700">
            Status:{" "}
            <span className="font-semibold">
              {paused ? "Paused" : "Active"}
            </span>
          </p>
        </div>

        {!paused && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Optional reason (only you see this)"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 mb-4"
          />
        )}

        <button
          onClick={toggle}
          disabled={saving}
          className={`w-full font-semibold py-3 rounded-xl disabled:opacity-60 ${
            paused
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          {saving
            ? "Saving..."
            : paused
            ? "Unpause profile"
            : "Pause profile"}
        </button>
      </div>
    </div>
  );
}