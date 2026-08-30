"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ADMIN_TOOLBOX, USER_TOOLBOX } from "../../lib/routeIndex";
import AppShell from "../components/AppShell";

export default function HubPage() {
  const router = useRouter();

  return (
    <AppShell title="Hub" onBack={() => router.push("/more")}>
      <h2 className="font-semibold mb-2">Use today</h2>
      <div className="space-y-2 mb-6">
        {USER_TOOLBOX.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {item.label}
          </button>
        ))}
      </div>
      <h2 className="font-semibold mb-2">Admin</h2>
      <div className="space-y-2">
        {ADMIN_TOOLBOX.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {item.label}
          </button>
        ))}
      </div>
    </AppShell>
  );
}