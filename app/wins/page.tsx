"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { timeAgo } from "../../lib/format";
import { ArrowLeft } from "lucide-react";

interface Row {
  id: string;
  body: string;
  created_at: string;
}

export default function WinsPage() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data } = await supabase
      .from("wins")
      .select("id, body, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("wins").insert({
      user_id: user.id,
      body: body.trim(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setBody("");
    setMessage("Saved");
    await load();
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

        <h1 className="text-3xl font-bold mb-2">Small wins</h1>
        <p className="text-slate-500 text-sm mb-8">
          Log good moments from dating or life
        </p>

        <form onSubmit={save} className="space-y-3 mb-8">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Today I..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Add win
          </button>
        </form>

        {message && (
          <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {r.body}
              </p>
              <p className="text-xs text-slate-500 mt-1">{timeAgo(r.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}