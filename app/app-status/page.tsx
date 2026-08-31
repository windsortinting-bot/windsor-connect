"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function AppStatusPage() {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      setOk(!error);
    };
    run();
  }, []);

  return (
    <AppShell title="App status" onBack={() => router.push("/status")}>
      <p className={`text-sm ${ok ? "text-emerald-700" : ok === false ? "text-rose-600" : "text-slate-500"}`}>
        {ok === null ? "Checking..." : ok ? "Database reachable." : "Database check failed."}
      </p>
    </AppShell>
  );
}
