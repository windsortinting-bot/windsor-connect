"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

export default function AdminLivePage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
        const { count: n } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
        setCount(n ?? 0);
      } catch {
        setDenied(true);
      }
    };
    run();
  }, []);

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <AppShell title="Live users" onBack={() => router.push("/admin")}>
      <p className="text-3xl font-bold">{count ?? "..."}</p>
      <p className="text-sm text-slate-500 mt-2">profiles in the database</p>
    </AppShell>
  );
}
