"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Copy, Share2, Check } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "https://windsor-connect.vercel.app";

  const shareText = `Join me on Windsor Connect — local dating for Windsor, ON (519). ${shareUrl}`;

  const logClick = async () => {
    try {
      await supabase.from("invite_clicks").insert({ source: "share" });
    } catch {
      // ignore
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setStatus("Link copied");
      await logClick();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Could not copy — select and copy manually");
    }
  };

  const handleShare = async () => {
    await logClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Windsor Connect",
          text: "Local dating for Windsor, ON",
          url: shareUrl,
        });
        setStatus("Shared");
      } catch {
        // user cancelled
      }
    } else {
      await handleCopy();
    }
  };

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

        <h1 className="text-3xl font-bold mb-2">Invite friends</h1>
        <p className="text-slate-500 text-sm mb-8">
          Windsor works best when more locals join. Share the app.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <p className="text-sm text-slate-400 mb-2">Your invite link</p>
          <p className="text-white text-sm break-all bg-slate-800 rounded-xl px-3 py-3">
            {shareUrl}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
            {copied ? "Copied" : "Copy message"}
          </button>
        </div>

        {status && (
          <p className="text-center text-sm text-emerald-400 mt-4">{status}</p>
        )}

        <p className="text-xs text-slate-600 text-center mt-8">
          Tip: share in local Facebook groups, Discord, or with friends who
          actually live in the 519.
        </p>
      </div>
    </div>
  );
}