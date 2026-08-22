"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft } from "lucide-react";

export default function DailyPromptPage() {
  const router = useRouter();
  const [promptId, setPromptId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("What’s one thing you’re looking forward to this week?");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
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

      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("daily_prompts")
        .select("id, prompt")
        .eq("active_on", today)
        .maybeSingle();

      if (data) {
        setPromptId(data.id);
        setPrompt(data.prompt);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("prompt_answers").insert({
      user_id: user.id,
      prompt_id: promptId,
      answer: answer.trim(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await trackEvent("daily_prompt_answered");
    setMessage("Saved");
    setAnswer("");
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
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Daily prompt</h1>
        <p className="text-slate-500 text-sm mb-6">Private reflection for you</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-slate-800">{prompt}</p>
        </div>

        <form onSubmit={save} className="space-y-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
            placeholder="Write a few lines..."
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Save answer
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}