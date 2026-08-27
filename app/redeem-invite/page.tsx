"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function RedeemInvitePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
    };
    init();
  }, [router]);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !code.trim()) return;
    setStatus("loading");
    setMessage("");

    const cleaned = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from("invite_codes")
      .select("id, code, uses, max_uses, is_active")
      .eq("code", cleaned)
      .maybeSingle();

    if (error || !data) {
      setStatus("error");
      setMessage("That code was not found.");
      return;
    }
    if (!data.is_active) {
      setStatus("error");
      setMessage("That code is no longer active.");
      return;
    }
    if ((data.uses || 0) >= (data.max_uses || 0)) {
      setStatus("error");
      setMessage("That code is out of uses.");
      return;
    }

    const { error: upErr } = await supabase
      .from("profiles")
      .update({ invite_code_used: cleaned })
      .eq("id", userId);

    if (upErr) {
      setStatus("error");
      setMessage(upErr.message);
      return;
    }

    await supabase
      .from("invite_codes")
      .update({ uses: (data.uses || 0) + 1 })
      .eq("id", data.id);

    setStatus("success");
    setMessage(`Code ${cleaned} saved to your profile.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/invite")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Invites
        </button>

        <h1 className="text-3xl font-bold mb-2">Redeem invite</h1>
        <p className="text-slate-500 text-sm mb-8">Enter a Windsor Connect code</p>

        <form onSubmit={redeem} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="WINDSOR519"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 uppercase outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Checking..." : "Redeem"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm rounded-xl px-4 py-3 border ${
              status === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-rose-700 bg-rose-50 border-rose-200"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}