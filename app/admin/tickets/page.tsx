"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

type Ticket = {
  id?: string;
  user_id?: string;
  email?: string | null;
  subject?: string | null;
  body?: string | null;
  created_at?: string;
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Ticket[]>([]);
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
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) setMessage(error.message);
      else setRows((data as Ticket[]) || []);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading tickets...
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
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <h1 className="text-3xl font-bold mb-2">Support tickets</h1>
        <p className="text-slate-500 text-sm mb-6">{rows.length} total</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl p-4">
            No tickets yet.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((t, i) => (
              <div
                key={t.id || String(i)}
                className="bg-white border border-slate-200 rounded-2xl p-4"
              >
                <p className="font-semibold">{t.subject || "No subject"}</p>
                <p className="text-xs text-slate-500 mt-1">{t.email}</p>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                  {t.body || "No message"}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {t.created_at ? timeAgo(t.created_at) : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
