"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function ReplyNowPage() {
  const router = useRouter();

  return (
    <AppShell title="Reply now" onBack={() => router.push("/messages")}>
      <p className="text-sm text-slate-700 mb-4">
        Open chats and answer one person. That is enough for today.
      </p>
      <button
        type="button"
        onClick={() => router.push("/messages")}
        className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Open messages
      </button>
    </AppShell>
  );
}
