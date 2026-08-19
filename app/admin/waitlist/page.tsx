"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

interface WaitRow {
  id: string;
  email: string;
  created_at: string;
  source: string | null;
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<WaitRow[]>([]);
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

      const { data, error } = await supabase
        .from("waitlist")
        .select("id, email, created_at, source")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) setMessage(error.message);
      else setRows((data as WaitRow[]) || []);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading waitlist...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p>Admin access required.</p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 bg-slate-800 px-6 py-3 rounded-xl text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <h1 className="text-3xl font-bold mb-2">Waitlist</h1>
        <p className="text-slate-500 text-sm mb-6">{rows.length} emails</p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
            >
              <p className="text-sm text-white break-all">{r.email}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(r.created_at).toLocaleString()} · {r.source || "landing"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}