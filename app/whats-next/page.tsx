"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LAUNCH_PATH } from "../../lib/launchCheck";
import AppShell from "../components/AppShell";

export default function WhatsNextPage() {
  const router = useRouter();

  return (
    <AppShell title="What's next" onBack={() => router.push("/go")}>
      <p className="text-sm text-slate-600 mb-4">
        Do these in order. Stop when something breaks and write it in /testers.
      </p>
      <div className="space-y-2">
        {LAUNCH_PATH.map((item, index) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left"
          >
            <p className="text-xs text-slate-400">Step {index + 1}</p>
            <p className="font-semibold mt-1">{item.label}</p>
            <p className="text-sm text-slate-600 mt-1">{item.why}</p>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
