"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { signOutNow } from "../../lib/signOutNow";
import AppShell from "../components/AppShell";

export default function SwitchAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setEmail(user.email ?? null);
    };
    load();
  }, [router]);

  const switchAccount = async () => {
    setBusy(true);
    try {
      await signOutNow();
    } finally {
      router.replace("/auth");
      router.refresh();
    }
  };

  return (
    <AppShell title="Switch account" onBack={() => router.push("/settings")}>
      <p className="text-sm text-slate-600 mb-6">
        Signed in as {email || "this account"}. Sign out to use a different
        account on this device.
      </p>
      <button
        type="button"
        onClick={switchAccount}
        disabled={busy}
        className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl disabled:opacity-60"
      >
        {busy ? "Signing out..." : "Sign out and switch"}
      </button>
    </AppShell>
  );
}
