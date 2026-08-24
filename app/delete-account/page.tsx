"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { requestAccountDeletion } from "../../lib/profileActions";
import { ArrowLeft } from "lucide-react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
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
      setLoading(false);
    };
    load();
  }, [router]);

  const submit = async () => {
    if (!userId || confirmText !== "DELETE") return;
    setSaving(true);
    setMessage("");
    try {
      await requestAccountDeletion(userId);
      setMessage(
        "Deletion requested. Your profile is paused. An admin will complete removal shortly."
      );
    } catch (err: any) {
      setMessage(err?.message || "Could not request deletion");
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

        <h1 className="text-3xl font-bold mb-2 text-rose-700">Delete account</h1>
        <p className="text-slate-500 text-sm mb-8">
          Type DELETE to request permanent account removal
        </p>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 mb-4"
        />

        <button
          onClick={submit}
          disabled={saving || confirmText !== "DELETE"}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          {saving ? "Submitting..." : "Request deletion"}
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