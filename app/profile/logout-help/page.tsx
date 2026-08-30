"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../../components/LogoutButton";
import AppShell from "../../components/AppShell";

export default function LogoutHelpPage() {
  const router = useRouter();

  return (
    <AppShell title="Account" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4">
        Sign out of this browser. You can sign back in from /auth.
      </p>
      <LogoutButton className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl" />
    </AppShell>
  );
}