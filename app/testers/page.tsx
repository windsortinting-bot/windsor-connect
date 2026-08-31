"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import LogoutButton from "../components/LogoutButton";

const LINKS = [
  { href: "/smoke", label: "Smoke check" },
  { href: "/welcome-back", label: "Welcome back" },
  { href: "/settings", label: "Settings" },
  { href: "/profile/menu", label: "Profile menu" },
  { href: "/switch-account", label: "Switch account" },
  { href: "/logout", label: "Logout page" },
];

export default function TestersPage() {
  const router = useRouter();

  return (
    <AppShell title="Testers" onBack={() => router.push("/settings")}>
      <p className="text-sm text-slate-600 mb-6">
        Soft-launch tester shortcuts. Swipe and chat stay on their existing
        routes.
      </p>
      <div className="space-y-3 mb-8">
        {LINKS.map((l) => (
          <button
            key={l.href}
            type="button"
            onClick={() => router.push(l.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <LogoutButton className="w-full justify-center text-rose-600 hover:text-rose-700 font-medium" />
      </div>
    </AppShell>
  );
}
