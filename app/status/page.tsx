"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function StatusPage() {
  const router = useRouter();
  const [health, setHealth] = useState<string>("Checking...");
  const [stats, setStats] = useState<{
    onboarded_profiles?: number;
    matches?: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const h = await fetch("/api/health").then((r) => r.json());
        setHealth(h?.ok ? "All systems operational" : "Degraded");
      } catch {
        setHealth("Unavailable");
      }

      try {
        const s = await fetch("/api/stats/public").then((r) => r.json());
        if (s?.ok) setStats(s);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Status</h1>
        <p className="text-slate-500 text-sm mb-8">Windsor Connect service status</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="text-sm text-slate-400">API</p>
          <p className="text-lg font-semibold text-white mt-1">{health}</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-2xl font-bold">{stats.onboarded_profiles}</p>
              <p className="text-xs text-slate-500 mt-1">Onboarded profiles</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-2xl font-bold">{stats.matches}</p>
              <p className="text-xs text-slate-500 mt-1">Matches created</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}