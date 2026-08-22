"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft } from "lucide-react";

const OPTIONS = [
  { value: "serious", label: "Something serious" },
  { value: "dating", label: "Dating and seeing where it goes" },
  { value: "friends_first", label: "Friends first" },
  { value: "figuring_out", label: "Still figuring it out" },
];

export default function IntentPage() {
  const router = useRouter();
  const [intent, setIntent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
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
        .select("dating_intent")
        .eq("id", user.id)
        .single();

      setIntent(data?.dating_intent || "");
      setLoading(false);
    };
    load();
  }, [router]);

  const save = async () => {
    if (!intent) {
      setMessage("Pick one option");
      return;
    }
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ dating_intent: intent })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    await trackEvent("dating_intent_set", { intent });
    setMessage("Saved");
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
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-2">What are you looking for?</h1>
        <p className="text-slate-500 text-sm mb-8">
          Helps people understand your intentions
        </p>

        <div className="space-y-2 mb-6">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setIntent(o.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                intent === o.value
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}