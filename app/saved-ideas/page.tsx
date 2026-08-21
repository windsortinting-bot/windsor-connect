"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { DATE_IDEAS } from "../../lib/ideas";
import { ArrowLeft, Bookmark } from "lucide-react";

export default function SavedIdeasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);

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
        .from("saved_ideas")
        .select("idea_key")
        .eq("user_id", user.id);

      setKeys((data || []).map((r) => r.idea_key));
      setLoading(false);
    };
    load();
  }, [router]);

  const saved = DATE_IDEAS.filter((i) => keys.includes(i.key));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading saved ideas...
      </div>
    );
  }

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

        <h1 className="text-3xl font-bold mb-2">Saved date ideas</h1>
        <p className="text-slate-500 text-sm mb-8">
          Ideas you bookmarked for later
        </p>

        {saved.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">No saved ideas yet.</p>
            <button
              onClick={() => router.push("/ideas")}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              Browse ideas
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map((idea) => (
              <div
                key={idea.key}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="font-semibold">{idea.title}</p>
                <p className="text-xs text-rose-600 mt-1">{idea.area}</p>
                <p className="text-sm text-slate-500 mt-2">{idea.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}