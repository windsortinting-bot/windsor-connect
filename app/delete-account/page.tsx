"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft } from "lucide-react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setReady(true);
    };
    load();
  }, [router]);

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setMessage('Type DELETE to confirm');
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    await trackEvent("account_deleted");
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!ready) {
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

        <h1 className="text-3xl font-bold mb-2 text-rose-600">Delete account</h1>
        <p className="text-slate-500 text-sm mb-6">
          This permanently removes your profile, matches, swipes, and messages
          you sent. This cannot be undone.
        </p>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-800 mb-6">
          Type <span className="font-mono font-semibold">DELETE</span> below to
          confirm.
        </div>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 mb-4"
        />

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <button
          onClick={handleDelete}
          disabled={status === "loading"}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
        >
          {status === "loading" ? "Deleting..." : "Permanently delete account"}
        </button>
      </div>
    </div>
  );
}