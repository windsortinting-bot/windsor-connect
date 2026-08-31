"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

type Row = { label: string; ok: boolean };

export default function ProfileCheckPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name, bio, photo_urls, neighborhood")
        .eq("id", user.id)
        .maybeSingle();
      setRows([
        { label: "Name", ok: Boolean(data?.first_name) },
        { label: "Photo", ok: Boolean(data?.photo_urls?.length) },
        { label: "Bio", ok: Boolean(data?.bio) },
        { label: "Neighborhood", ok: Boolean(data?.neighborhood) },
      ]);
    };
    run();
  }, [router]);

  return (
    <AppShell title="Profile check" onBack={() => router.push("/profile")}>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex justify-between text-sm"
          >
            <span>{row.label}</span>
            <span className={row.ok ? "text-emerald-600" : "text-rose-600"}>
              {row.ok ? "OK" : "Missing"}
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
