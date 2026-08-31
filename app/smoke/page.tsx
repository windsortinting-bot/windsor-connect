"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

type Row = { label: string; ok: boolean };

export default function SmokePage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      const checks: Row[] = [];
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      checks.push({
        label: "Supabase env loaded",
        ok: url.startsWith("https://") && url.includes("supabase.co"),
      });

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      checks.push({
        label: "Auth session call works",
        ok: !sessionError,
      });
      checks.push({
        label: "Signed in",
        ok: Boolean(sessionData.session?.user),
      });

      const { error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      checks.push({ label: "Profiles table reachable", ok: !profileError });

      setRows(checks);
    };
    run();
  }, []);

  return (
    <AppShell title="Smoke test" onBack={() => router.push("/profile")}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm flex justify-between"
          >
            <span>{row.label}</span>
            <span className={row.ok ? "text-emerald-600" : "text-rose-600"}>
              {row.ok ? "OK" : "FAIL"}
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
