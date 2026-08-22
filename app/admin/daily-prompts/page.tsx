"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

interface Row {
  id: string;
  prompt: string;
  active_on: string | null;
}

export default function AdminDailyPromptsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [prompt, setPrompt] = useState("");
  const [activeOn, setActiveOn] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!me?.is_admin) {
      setDenied(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("daily_prompts")
      .select("id, prompt, active_on")
      .order("active_on", { ascending: false })
      .limit(50);

    if (error) setMessage(error.message);
    else setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const { error } = await supabase.from("daily_prompts").insert({
      prompt: prompt.trim(),
      active_on: activeOn,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setPrompt("");
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">Daily prompts</h1>
        <p className="text-slate-500 text-sm mb-6">Schedule reflection prompts</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={add} className="space-y-3 mb-8">
          <input
            type="date"
            value={activeOn}
            onChange={(e) => setActiveOn(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3"
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Prompt text"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Add prompt
          </button>
        </form>

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <p className="text-xs text-slate-500">{r.active_on || "no date"}</p>
              <p className="text-sm mt-1">{r.prompt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}