"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { trackEvent } from "../../../lib/analytics";
import { ArrowLeft, Download } from "lucide-react";

export default function ExportDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setLoading(false);
    };
    check();
  }, [router]);

  const handleExport = async () => {
    setExporting(true);
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
      supabase
        .from("messages")
        .select("*")
        .eq("sender_id", user.id),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile.data,
      swipes: swipes.data || [],
      matches: matches.data || [],
      messages_sent: messages.data || [],
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

    await trackEvent("data_exported");
    setMessage("Download started");
    setExporting(false);
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
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Export my data</h1>
        <p className="text-slate-500 text-sm mb-8">
          Download a copy of your profile, swipes, matches, and sent messages.
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Preparing..." : "Download JSON"}
        </button>
      </div>
    </div>
  );
}