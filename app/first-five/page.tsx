"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function FirstFivePage() {
  const router = useRouter();

  return (
    <AppShell title="First five minutes" onBack={() => router.push("/welcome-back")}>
      <ol className="text-sm text-slate-700 space-y-3 list-decimal pl-5 mb-6">
        <li>Open Profile. Confirm your name and photo.</li>
        <li>Swipe three people. Do not overthink it.</li>
        <li>If you match, send one specific question.</li>
        <li>If you do not match, stop. Come back tomorrow.</li>
        <li>Log out from Profile so the next tester can sign in.</li>
      </ol>
      <button
        type="button"
        onClick={() => router.push("/swipe")}
        className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Start swipe
      </button>
    </AppShell>
  );
}
