"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

interface Note {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function AdminNotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
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
      .from("ops_notes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) setMessage(error.message);
    else setNotes((data as Note[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const { error } = await supabase.from("ops_notes").insert({
      title: title.trim(),
      body: body.trim(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setBody("");
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading notes...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">Ops notes</h1>
        <p className="text-slate-500 text-sm mb-6">
          Private launch notes for admins
        </p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={addNote} className="space-y-3 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Note"
            rows={4}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Save note
          </button>
        </form>

        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
              <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">
                {n.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}