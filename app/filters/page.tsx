"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const LOOKING_FOR = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
];

export default function FiltersPage() {
  const router = useRouter();
  const [lookingFor, setLookingFor] = useState("everyone");
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
        .select("looking_for")
        .eq("id", user.id)
        .single();

      setLookingFor(data?.looking_for || "everyone");
      setLoading(false);
    };
    load();
  }, [router]);

  const save = async () => {
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ looking_for: lookingFor })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Filters saved. Swipe stack will update.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading filters...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-2">Discovery filters</h1>
        <p className="text-sm text-slate-500 mb-8">
          Who you want to see in Discover
        </p>

        <div className="space-y-2 mb-6">
          {LOOKING_FOR.map((o) => (
            <button
              key={o.value}
              onClick={() => setLookingFor(o.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                lookingFor === o.value
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white"
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
          {saving ? "Saving..." : "Save filters"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <button
          onClick={() => router.push("/swipe")}
          className="mt-3 w-full border border-slate-200 bg-white rounded-xl py-3 text-sm"
        >
          Back to Discover
        </button>
      </div>
    </div>
  );
}