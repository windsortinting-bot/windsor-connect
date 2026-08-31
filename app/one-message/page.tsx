"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function OneMessagePage() {
  const router = useRouter();

  return (
    <AppShell title="One message" onBack={() => router.push("/messages")}>
      <p className="text-sm text-slate-700 mb-4">
        If you have a match, send one specific question. Do not send hey.
      </p>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/copy-opener")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Copy an opener
        </button>
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
        >
          Open chats
        </button>
      </div>
    </AppShell>
  );
}
