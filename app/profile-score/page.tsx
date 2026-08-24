"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { profileCompleteness } from "../../lib/completeness";
import { ArrowLeft } from "lucide-react";

export default function ProfileScorePage() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select(
          "first_name, age, bio, photo_urls, neighborhood, gender, looking_for"
        )
        .eq("id", user.id)
        .single();

      const result = profileCompleteness(data || {});
      setScore(result.score);
      setMissing(result.missing);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Checking profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-2">Profile strength</h1>
        <p className="text-slate-500 text-sm mb-8">Complete profiles get better matches</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center mb-6">
          <p className="text-5xl font-bold text-rose-500">{score}%</p>
          <p className="text-sm text-slate-500 mt-2">complete</p>
        </div>

        {missing.length === 0 ? (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            Looking strong — nice work.
          </p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm font-medium mb-3">Still missing</p>
            <ul className="space-y-2">
              {missing.map((m) => (
                <li key={m} className="text-sm text-slate-600">
                  • {m}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/onboarding")}
              className="mt-4 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl text-sm"
              type="button"
            >
              Finish profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}