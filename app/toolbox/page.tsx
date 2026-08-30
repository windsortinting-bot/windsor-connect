"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { USER_TOOLBOX } from "../../lib/routeIndex";
import AppShell from "../components/AppShell";

const EXTRA = [
  { href: "/today", label: "Today" },
  { href: "/next-best", label: "Next best step" },
  { href: "/after-match", label: "After a match" },
  { href: "/gaps", label: "Profile gaps" },
  { href: "/plan-text", label: "Plan text" },
  { href: "/done-today", label: "Done today" },
];

export default function ToolboxPage() {
  const router = useRouter();
  const links = [...EXTRA, ...USER_TOOLBOX];

  return (
    <AppShell title="Toolbox" onBack={() => router.push("/hub")}>
      <div className="space-y-3">
        {links.map((item) => (
          <button
            key={item.href + item.label}
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