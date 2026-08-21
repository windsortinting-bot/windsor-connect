"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [counts, setCounts] = useState({
    profiles: 0,
    matches: 0,
    reports: 0,
    support: 0,
    feedback: 0,
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

      const safeCount = async (table: string) => {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        return count ?? 0;
      };

      const [profiles, matches, reports, support, feedback, waitlist] =
        await Promise.all([
          safeCount("profiles"),
          safeCount("matches"),
          safeCount("reports"),
          safeCount("support_messages"),
          safeCount("feedback"),
          safeCount("waitlist"),
        ]);

      setCounts({ profiles, matches, reports, support, feedback, waitlist });
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading overview...
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

  const cards = [
    { label: "Profiles", value: counts.profiles },
    { label: "Matches", value: counts.matches },
    { label: "Reports", value: counts.reports },
    { label: "Support", value: counts.support },
    { label: "Feedback", value: counts.feedback },
    { label: "Waitlist", value: counts.waitlist },
  ];

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

        <h1 className="text-3xl font-bold mb-2">Overview</h1>
        <p className="text-slate-500 text-sm mb-8">Soft-launch snapshot</p>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-slate-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}