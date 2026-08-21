"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

interface Entry {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
}

export default function AdminChangelogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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
      .from("changelog")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setRows((data as Entry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const { error } = await supabase.from("changelog").insert({
      title: title.trim(),
      body: body.trim(),
      published: true,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setBody("");
    await load();
  };

  const toggle = async (row: Entry) => {
    const { error } = await supabase
      .from("changelog")
      .update({ published: !row.published })
      .eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }
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

        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-slate-500 text-sm mb-6">Publish soft-launch notes</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={add} className="space-y-3 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Update details"
            rows={4}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Publish update
          </button>
        </form>

        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {timeAgo(r.created_at)} · {r.published ? "live" : "hidden"}
                  </p>
                </div>
                <button
                  onClick={() => toggle(r)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                >
                  {r.published ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}