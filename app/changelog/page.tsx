"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { timeAgo } from "../../lib/format";
import { ArrowLeft } from "lucide-react";

interface Entry {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function ChangelogPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("changelog")
        .select("id, title, body, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(30);

      setRows((data as Entry[]) || []);
      setLoading(false);
    };
    load();
  }, []);

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

        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-slate-500 text-sm mb-8">
          Soft-launch updates for Windsor Connect
        </p>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-500 text-sm">No updates yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="font-semibold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {timeAgo(r.created_at)}
                </p>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}