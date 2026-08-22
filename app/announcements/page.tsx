"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { timeAgo } from "../../lib/format";
import { ArrowLeft } from "lucide-react";

interface Row {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(30);

      setRows((data as Row[]) || []);
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

        <h1 className="text-3xl font-bold mb-2">Announcements</h1>
        <p className="text-slate-500 text-sm mb-8">
          Official notes from Windsor Connect
        </p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="font-semibold">{r.title}</p>
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