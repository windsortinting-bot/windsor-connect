"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

type Blocked = {
  id: string;
  blocked_id: string;
  first_name?: string;
};

export default function BlockedPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Blocked[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: blocks, error } = await supabase
      .from("blocks")
      .select("id, blocked_id")
      .eq("blocker_id", user.id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const enriched: Blocked[] = [];
    for (const b of blocks || []) {
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", b.blocked_id)
        .maybeSingle();
      enriched.push({
        id: b.id,
        blocked_id: b.blocked_id,
        first_name: p?.first_name || "User",
      });
    }
    setRows(enriched);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const unblock = async (blockId: string) => {
    const { error } = await supabase.from("blocks").delete().eq("id", blockId);
    if (error) {
      setMessage(error.message);
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading blocked users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Blocked users</h1>
        <p className="text-slate-500 text-sm mb-8">{rows.length} blocked</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {rows.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-500">
            You have not blocked anyone.
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between"
              >
                <span className="font-medium">{r.first_name}</span>
                <button
                  type="button"
                  onClick={() => unblock(r.id)}
                  className="text-sm text-rose-600"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}