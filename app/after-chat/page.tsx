"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function AfterChatPage() {
  const router = useRouter();

  return (
    <AppShell title="After you chat" onBack={() => router.push("/messages")}>
      <ol className="text-sm text-slate-700 space-y-3 list-decimal pl-5">
        <li>If it feels easy, suggest a public spot.</li>
        <li>If it feels off, you can unmatch. You do not owe a date.</li>
        <li>Tell a friend where you are going.</li>
      </ol>
      <button
        type="button"
        onClick={() => router.push("/windsor-spots")}
        className="w-full mt-6 bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Pick a spot
      </button>
    </AppShell>
  );
}
