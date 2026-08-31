"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function InviteAFriendPage() {
  const router = useRouter();

  return (
    <AppShell title="Invite a friend" onBack={() => router.push("/invite")}>
      <p className="text-sm text-slate-700 mb-4">
        Windsor Connect works only if more people from Windsor join. Send the site to one person you trust.
      </p>
      <button
        type="button"
        onClick={() => router.push("/invite")}
        className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Open invite codes
      </button>
    </AppShell>
  );
}
