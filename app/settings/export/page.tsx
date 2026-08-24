"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function ExportDataPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const [profile, swipes, matches, messages] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("swipes").select("*").eq("swiper_id", user.id),
      supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
      supabase.from("messages").select("*").eq("sender_id", user.id),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile.data,
      swipes: swipes.data,
      matches: matches.data,
      messages_sent: messages.data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `windsor-connect-export-${user.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMessage("Export downloaded.");
    setLoading(false);
  };

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

        <h1 className="text-3xl font-bold mb-2">Export my data</h1>
        <p className="text-slate-500 text-sm mb-8">
          Download a JSON copy of your profile activity
        </p>

        <button
          onClick={exportData}
          disabled={loading}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          {loading ? "Preparing..." : "Download export"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}