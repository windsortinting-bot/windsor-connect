"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [targetGender, setTargetGender] = useState("everyone");
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(55);
  const [preferredNeighborhoods, setPreferredNeighborhoods] = useState<
    string[]
  >([]);

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

      const { data: p } = await supabase
        .from("profiles")
        .select(
          "target_gender, min_age_pref, max_age_pref, preferred_neighborhoods"
        )
        .eq("id", user.id)
        .single();

      if (p) {
        setTargetGender(p.target_gender || "everyone");
        setMinAge(p.min_age_pref || 21);
        setMaxAge(p.max_age_pref || 55);
        setPreferredNeighborhoods(p.preferred_neighborhoods || []);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        target_gender: targetGender,
        min_age_pref: Math.min(minAge, maxAge),
        max_age_pref: Math.max(minAge, maxAge),
        preferred_neighborhoods: preferredNeighborhoods,
      })
      .eq("id", userId);

    if (error) setMessage(error.message);
    else {
      setMessage("Filters saved");
      setTimeout(() => router.push("/swipe"), 600);
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

        <h1 className="text-3xl font-bold mb-2">Filters</h1>
        <p className="text-slate-500 text-sm mb-8">
          Who you want to see in Windsor
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Looking for</label>
            <select
              value={targetGender}
              onChange={(e) => setTargetGender(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="everyone">Everyone</option>
              <option value="woman">Women</option>
              <option value="man">Men</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Min age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">Max age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Preferred neighborhoods (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {NEIGHBORHOODS.map((n) => {
                const active = preferredNeighborhoods.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleNeighborhood(n)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      active
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-300"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {saving ? "Saving..." : "Save filters"}
          </button>
        </form>
      </div>
    </div>
  );
}