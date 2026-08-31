"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../../components/LogoutButton";
import AppShell from "../../components/AppShell";

const LINKS = [
  { href: "/profile", label: "My profile" },
  { href: "/settings", label: "Settings" },
  { href: "/switch-account", label: "Switch account" },
  { href: "/welcome-back", label: "Welcome back" },
  { href: "/go", label: "Quick start" },
  { href: "/smoke", label: "Smoke test" },
  { href: "/testers", label: "Tester list" },
];

export default function ProfileMenuPage() {
  const router = useRouter();

  return (
    <AppShell title="Account menu" onBack={() => router.push("/profile")}>
      <div className="space-y-2">
        {LINKS.map((item) => (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-left text-sm"
          >
            {item.label}
          </button>
        ))}
        <LogoutButton className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl" />
      </div>
    </AppShell>
  );
}
