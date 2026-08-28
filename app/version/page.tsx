"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function VersionPage() {
  const router = useRouter();

  return (
    <AppShell title="Version" onBack={() => router.push("/more")}>
      <div className="bg-white border border-slate-200 rounded-2xl p-4 text-sm space-y-2">
        <p>App: Windsor Connect</p>
        <p>Channel: soft launch</p>
        <p>Build family: Next.js 16 + Supabase</p>
        <p>Focus: matching, chat, safety, admin tools</p>
      </div>
    </AppShell>
  );
}