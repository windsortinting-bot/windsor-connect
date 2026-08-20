"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

const CHECKS = [
  "Invite codes created and tested",
  "At least 10 onboarded local profiles",
  "Reports queue reviewed",
  "Support inbox checked",
  "Safety + guidelines pages readable",
  "Match badge counts look correct",
  "Chat send + receive tested on two accounts",
  "Block + unmatch tested",
  "Waitlist form on landing works",
  "Vercel env vars set (Supabase URL + anon key)",
];

export default function AdminChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>({});

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
      if (!me?.is_admin) setDenied(true);

      try {
        const raw = localStorage.getItem("wc_admin_checklist");
        if (raw) setDone(JSON.parse(raw));
      } catch {
        // ignore
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try {
        localStorage.setItem("wc_admin_checklist", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Admin access required.
      </div>
    );
  }

  const completed = Object.values(done).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">Soft-launch checklist</h1>
        <p className="text-slate-500 text-sm mb-6">
          {completed}/{CHECKS.length} complete
        </p>

        <div className="space-y-2">
          {CHECKS.map((label, i) => {
            const on = !!done[i];
            return (
              <button
                key={label}
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 text-left bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
              >
                {on ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-sm ${
                    on ? "text-slate-400 line-through" : "text-slate-200"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}