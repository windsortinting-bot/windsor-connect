"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Share2, Check } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://windsor-connect.vercel.app";

  const shareText = `Looking for something real in Windsor? Try Windsor Connect — a city-first dating app for the 519.\n\n${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Could not copy. Long-press the link instead.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Windsor Connect",
          text: "City-first dating for Windsor, ON",
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

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

        <h1 className="text-3xl font-bold mb-2">Invite friends</h1>
        <p className="text-slate-400 text-sm mb-8">
          Windsor Connect works best when more locals join. Share it with
          someone in the 519.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
          <p className="text-xs text-slate-500 mb-2">Your link</p>
          <p className="text-sm text-rose-400 break-all">{shareUrl}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy link
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3.5 rounded-xl"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <p className="text-xs text-slate-600 text-center mt-8 whitespace-pre-line">
          {shareText}
        </p>
      </div>
    </div>
  );
}