"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import LogoutButton from "../components/LogoutButton";
import AppShell from "../components/AppShell";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setEmail(user.email || "");
    };
    run();
  }, [router]);

  return (
    <AppShell title="Account" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-4 break-all">{email || "Signed in"}</p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Settings
        </button>
        <button
          type="button"
          onClick={() => router.push("/switch-account")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Switch account
        </button>
        <LogoutButton className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl" />
      </div>
    </AppShell>
  );
}
