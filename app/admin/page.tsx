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
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
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

      const [
        profiles,
        onboarded,
        matches,
        messages,
        reports,
        blocked,
        waitlist,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_onboarded", true),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("blocks").select("*", { count: "exact", head: true }),
        supabase.from("waitlist").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        profiles: profiles.count ?? 0,
        onboarded: onboarded.count ?? 0,
        matches: matches.count ?? 0,
        messages: messages.count ?? 0,
        reports: reports.count ?? 0,
        blocked: blocked.count ?? 0,
        waitlist: waitlist.count ?? 0,
      });

      setLoading(false);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p className="text-slate-300">Admin access required.</p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 bg-slate-800 px-6 py-3 rounded-xl text-sm"
        >
          Back
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
        <p className="text-slate-500 text-sm mb-8">Windsor Connect overview</p>

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
      </div>
    </div>
  );
}