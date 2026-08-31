"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutNow } from "../../lib/signOutNow";
import AppShell from "../components/AppShell";

export default function SwitchAccountPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    await signOutNow();
    router.replace("/auth");
  };

  return (
    <AppShell title="Switch account" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4">
        Use this when testing two accounts. It signs the current account out, then opens login.
      </p>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl disabled:opacity-60"
      >
        {busy ? "Signing out..." : "Log out and switch"}
      </button>
    </AppShell>
  );
}
