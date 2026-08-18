"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

const NEIGHBORHOODS = [
  "Walkerville",
  "Downtown",
  "Ford City",
  "Riverside",
  "South Windsor",
  "University of Windsor",
];

export default function FiltersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(55);
  const [targetGender, setTargetGender] = useState("everyone");
  const [preferredNeighborhoods, setPreferredNeighborhoods] = useState<
    string[]
  >([]);
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

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "min_age_pref, max_age_pref, target_gender, preferred_neighborhoods"
        )
        .eq("id", user.id)
        .single();

      if (profile) {
        setMinAge(profile.min_age_pref ?? 21);
        setMaxAge(profile.max_age_pref ?? 55);
        setTargetGender(profile.target_gender ?? "everyone");
        setPreferredNeighborhoods(profile.preferred_neighborhoods ?? []);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const toggleNeighborhood = (n: string) => {
    setPreferredNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage("");

    let min = Math.min(minAge, maxAge);
    let max = Math.max(minAge, maxAge);
    min = Math.max(18, Math.min(99, min));
    max = Math.max(18, Math.min(99, max));

    const { error } = await supabase
      .from("profiles")
      .update({
        min_age_pref: min,
        max_age_pref: max,
        target_gender: targetGender,
        preferred_neighborhoods: preferredNeighborhoods,
      })
      .eq("id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Filters saved. Your next swipe batch will use them.");
      setMinAge(min);
      setMaxAge(max);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading filters...
      </div>
    );
  }

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

        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-6 h-6 text-rose-400" />
          <h1 className="text-3xl font-bold">Discovery filters</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          Control who shows up in your daily batch
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Looking for
            </label>
            <select
              value={targetGender}
              onChange={(e) => setTargetGender(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500"
            >
              <option value="everyone">Everyone</option>
              <option value="woman">Women</option>
              <option value="man">Men</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-2">
                Min age
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">
                Max age
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <p className="text-sm text-slate-400 mb-3">
            Preferred neighborhoods (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((n) => {
              const active = preferredNeighborhoods.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNeighborhood(n)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    active
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Leave empty to see all Windsor areas.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
        >
          {saving ? "Saving..." : "Save filters"}
        </button>
      </div>
    </div>
  );
}