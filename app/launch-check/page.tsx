"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LAUNCH_PATH } from "../../lib/launchCheck";
import AppShell from "../components/AppShell";

export default function LaunchCheckPage() {
  const router = useRouter();
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <AppShell title="Launch check" onBack={() => router.push("/testers")}>
      <div className="space-y-2">
        {LAUNCH_PATH.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() =>
              setDone((prev) => ({ ...prev, [item.href]: !prev[item.href] }))
            }
            className={`w-full rounded-xl p-4 text-left border ${
              done[item.href]
                ? "bg-emerald-50 border-emerald-200"
                : "bg-white border-slate-200"
            }`}
          >
            <p className="font-semibold">{item.label}</p>
            <p className="text-sm text-slate-600 mt-1">{item.why}</p>
            <p className="text-xs mt-2">{done[item.href] ? "Checked" : "Tap to check"}</p>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
