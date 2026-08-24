"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { timeAgo } from "../../../lib/format";
import { ArrowLeft } from "lucide-react";

type Ticket = {
  id: string;
  email: string | null;
  subject: string;
  body: string;
  status: string | null;
  created_at: string;
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
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
      .from("support_tickets")
      .select("id, email, subject, body, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMessage(error.message);
    else setRows((data as Ticket[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const resolve = async (id: string) => {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: "resolved" })
      .eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  };

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
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-6">Support tickets</h1>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold text-sm">{t.subject}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t.email || "no email"} · {t.status || "open"} · {timeAgo(t.created_at)}
              </p>
              <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{t.body}</p>
              {t.status !== "resolved" && (
                <button
                  type="button"
                  onClick={() => resolve(t.id)}
                  className="mt-3 text-xs border border-emerald-200 text-emerald-700 rounded-lg px-3 py-1.5"
                >
                  Mark resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}