"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { setPaused } from "../../lib/profileActions";
import { ArrowLeft } from "lucide-react";

export default function PausePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [paused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      const { data } = await supabase
        .from("profiles")
        .select("is_paused")
        .eq("id", user.id)
        .single();

      setIsPaused(!!data?.is_paused);
      setLoading(false);
    };
    load();
  }, [router]);

  const toggle = async () => {
    if (!userId || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const next = !paused;
      await setPaused(userId, next);
      setIsPaused(next);
      setMessage(next ? "Profile paused. You will not appear in discovery." : "Profile is active again.");
    } catch (err: any) {
      setMessage(err?.message || "Could not update pause status");
    }
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
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Pause profile</h1>
        <p className="text-slate-500 text-sm mb-8">
          Hide yourself from swipe without deleting your account
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <p className="text-sm">
            Status:{" "}
            <span className={paused ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
              {paused ? "Paused" : "Active"}
            </span>
          </p>
        </div>

        <button
          onClick={toggle}
          disabled={saving}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          {saving ? "Saving..." : paused ? "Unpause profile" : "Pause profile"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}