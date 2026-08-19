"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  ArrowLeft,
  Users,
  Heart,
  MessageCircle,
  Flag,
  Ban,
  Ticket,
} from "lucide-react";

async function safeCount(table: string, filter?: (q: any) => any) {
  try {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({
    profiles: 0,
    onboarded: 0,
    matches: 0,
    messages: 0,
    reports: 0,
    blocked: 0,
    waitlist: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/auth");
          return;
        }

        const { data: me, error: meError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (meError) {
          setErrorMsg(meError.message);
          setLoading(false);
          return;
        }

        if (!me?.is_admin) {
          setDenied(true);
          setLoading(false);
          return;
        }

        const [
          profiles,
          onboarded,
          matches,
          messages,
          reports,
          blocked,
          waitlist,
        ] = await Promise.all([
          safeCount("profiles"),
          safeCount("profiles", (q) => q.eq("is_onboarded", true)),
          safeCount("matches"),
          safeCount("messages"),
          safeCount("reports"),
          safeCount("blocks"),
          safeCount("waitlist"),
        ]);

        setStats({
          profiles,
          onboarded,
          matches,
          messages,
          reports,
          blocked,
          waitlist,
        });
      } catch (e: any) {
        setErrorMsg(e?.message || "Failed to load admin");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading admin...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center">
        <p className="text-slate-300 mb-2">Admin access required.</p>
        <p className="text-xs text-slate-500 mb-4">
          Set is_admin = true on your profile in Supabase.
        </p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-2 bg-slate-800 px-6 py-3 rounded-xl text-sm"
        >
          Back to profile
        </button>
      </div>
    );
  }

  const cards = [
    { label: "Profiles", value: stats.profiles, icon: Users },
    { label: "Onboarded", value: stats.onboarded, icon: Users },
    { label: "Matches", value: stats.matches, icon: Heart },
    { label: "Messages", value: stats.messages, icon: MessageCircle },
    { label: "Reports", value: stats.reports, icon: Flag },
    { label: "Blocks", value: stats.blocked, icon: Ban },
    { label: "Waitlist", value: stats.waitlist, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Admin</h1>
        <p className="text-slate-500 text-sm mb-6">Windsor Connect overview</p>

        {errorMsg && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {errorMsg}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <Icon className="w-4 h-4 text-rose-400 mb-2" />
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-slate-500 mt-1">{c.label}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/admin/reports")}
          className="w-full bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 rounded-xl py-3 text-sm"
        >
          Open reports queue
        </button>

        <button
          onClick={() => router.push("/admin/invites")}
          className="w-full mt-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4 text-rose-400" />
          Invite codes
        </button>
      </div>
    </div>
  );
}