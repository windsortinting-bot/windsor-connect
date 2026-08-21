"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft, Copy, Check } from "lucide-react";

export default function ReferPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
      const short = user.id.slice(0, 8).toUpperCase();
      setCode(`WC-${short}`);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      setLink(`${origin}/join?code=WC-${short}`);
    };
    load();
  }, [router]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      await trackEvent("referral_link_copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMessage("Could not copy");
    }
  };

  const saveReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !email.trim()) return;

    const { error } = await supabase.from("referrals").insert({
      referrer_id: userId,
      referred_email: email.trim().toLowerCase(),
      code,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await trackEvent("referral_email_logged");
    setMessage("Saved. Share your link with them too.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Invite friends</h1>
        <p className="text-slate-500 text-sm mb-8">
          Soft launch grows faster with local invites
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-1">Your code</p>
          <p className="font-mono text-lg font-semibold tracking-wide">{code}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-2">Share link</p>
          <p className="text-sm break-all text-slate-700 mb-3">{link}</p>
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <form onSubmit={saveReferral} className="space-y-3">
          <p className="text-sm text-slate-500">Optional: log who you invited</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@email.com"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm font-medium"
          >
            Save referral note
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}