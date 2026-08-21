"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { logSecurityEvent } from "../../lib/security";
import { timeAgo } from "../../lib/format";
import { ArrowLeft } from "lucide-react";

interface EventRow {
  id: string;
  event_name: string;
  created_at: string;
}

export default function SecurityPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("security_events")
        .select("id, event_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setEvents((data as EventRow[]) || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const sendReset = async () => {
    if (!email) return;
    setMessage("");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    await logSecurityEvent("password_reset_requested");
    setMessage("Password reset email sent.");
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
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Security</h1>
        <p className="text-slate-500 text-sm mb-8">Account protection tools</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm font-medium break-all">{email}</p>
        </div>

        <button
          onClick={sendReset}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl mb-3"
        >
          Email password reset link
        </button>

        <button
          onClick={() => router.push("/auth/forgot-password")}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm mb-6"
        >
          Open forgot password page
        </button>

        {message && (
          <p className="mb-6 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <h2 className="font-semibold mb-3">Recent security events</h2>
        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No events yet.</p>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3"
              >
                <p className="text-sm font-medium">{e.event_name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {timeAgo(e.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}