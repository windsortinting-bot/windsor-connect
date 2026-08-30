"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { USER_TOOLBOX } from "../../lib/routeIndex";
import AppShell from "../components/AppShell";

export default function ToolboxPage() {
  const router = useRouter();

  return (
    <AppShell title="Toolbox" onBack={() => router.push("/launch-home")}>
      <div className="space-y-3">
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
    </AppShell>
  );
}