"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv, supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function SmokePage() {
  const router = useRouter();
  const [session, setSession] = useState("checking");
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    const run = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setSession(user ? "signed in" : "signed out");
      } catch {
        setSession("error");
      }

      try {
        const res = await fetch("/api/health");
        const json = await res.json();
        setHealth(json?.ok ? "ok" : "down");
      } catch {
        setHealth("down");
      }
    };
    run();
  }, []);

  return (
    <AppShell title="Smoke" onBack={() => router.push("/testers")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-sm space-y-2 mb-6">
        <p>App render: ok</p>
        <p>Supabase env: {hasSupabaseEnv ? "yes" : "no"}</p>
        <p>Session: {session}</p>
        <p>Health API: {health}</p>
      </div>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.push("/testers")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
        >
          Tester notes
        </button>
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
        >
          Settings
        </button>
        <button
          type="button"
          onClick={() => router.push("/logout")}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
        >
          Logout
        </button>
      </div>
    </AppShell>
  );
}
