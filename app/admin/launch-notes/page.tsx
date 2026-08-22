"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function AdminLaunchNotesPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
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

      try {
        const raw = localStorage.getItem("wc_admin_launch_notes");
        if (raw) setText(raw);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const save = () => {
    try {
      localStorage.setItem("wc_admin_launch_notes", text);
      setMessage("Saved on this admin device");
    } catch {
      setMessage("Could not save");
    }
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

        <h1 className="text-3xl font-bold mb-2">Launch scratchpad</h1>
        <p className="text-slate-500 text-sm mb-6">
          Private notes on this browser only
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Invite list, outreach ideas, bugs to watch..."
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 mb-4"
        />

        <button
          onClick={save}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Save
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}