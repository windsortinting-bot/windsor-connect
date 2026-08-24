"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { saveFilters } from "../../lib/profileActions";
import { ArrowLeft } from "lucide-react";

const LOOKING = ["Men", "Women", "Everyone"];
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
  const [lookingFor, setLookingFor] = useState("Everyone");
  const [selected, setSelected] = useState<string[]>([]);
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

      const { data } = await supabase
        .from("profiles")
        .select("looking_for, preferred_neighborhoods")
        .eq("id", user.id)
        .single();

      if (data?.looking_for) setLookingFor(data.looking_for);
      if (Array.isArray(data?.preferred_neighborhoods)) {
        setSelected(data.preferred_neighborhoods);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const toggleN = (n: string) => {
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage("");
    try {
      await saveFilters({
        userId,
        lookingFor,
        preferredNeighborhoods: selected,
      });
      setMessage("Filters saved.");
    } catch (err: any) {
      setMessage(err?.message || "Could not save filters");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading filters...
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

        <h1 className="text-3xl font-bold mb-2">Discovery filters</h1>
        <p className="text-slate-500 text-sm mb-8">Who you want to see</p>

        <p className="text-sm font-medium mb-2">Looking for</p>
        <div className="space-y-2 mb-6">
          {LOOKING.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setLookingFor(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                lookingFor === opt
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium mb-2">Preferred neighborhoods</p>
        <div className="space-y-2 mb-6">
          {NEIGHBORHOODS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleN(n)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                selected.includes(n)
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          {saving ? "Saving..." : "Save filters"}
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