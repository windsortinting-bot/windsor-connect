"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { DATE_IDEAS } from "../../lib/ideas";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";

export default function IdeasPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
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
        .from("saved_ideas")
        .select("idea_key")
        .eq("user_id", user.id);

      setSaved(new Set((data || []).map((r) => r.idea_key)));
    };
    load();
  }, [router]);

  const toggle = async (key: string) => {
    if (!userId) return;
    setMessage("");

    if (saved.has(key)) {
      const { error } = await supabase
        .from("saved_ideas")
        .delete()
        .eq("user_id", userId)
        .eq("idea_key", key);

      if (error) {
        setMessage(error.message);
        return;
      }

      setSaved((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      return;
    }

    const { error } = await supabase.from("saved_ideas").insert({
      user_id: userId,
      idea_key: key,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await trackEvent("idea_saved", { key });
    setSaved((prev) => new Set(prev).add(key));
  };

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

        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-3xl font-bold">Date ideas</h1>
          <button
            onClick={() => router.push("/saved-ideas")}
            className="text-sm text-rose-600"
          >
            Saved
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          Local first-date ideas around Windsor
        </p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {DATE_IDEAS.map((idea) => {
            const isSaved = saved.has(idea.key);
            return (
              <div
                key={idea.key}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{idea.title}</p>
                    <p className="text-xs text-rose-600 mt-1">{idea.area}</p>
                    <p className="text-sm text-slate-500 mt-2">{idea.body}</p>
                  </div>
                  <button
                    onClick={() => toggle(idea.key)}
                    className="text-rose-600 flex-shrink-0"
                    aria-label={isSaved ? "Unsave idea" : "Save idea"}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}