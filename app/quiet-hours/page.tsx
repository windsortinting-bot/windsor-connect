"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function QuietHoursPage() {
  const router = useRouter();

  return (
    <AppShell title="Quiet hours" onBack={() => router.push("/settings")}>
      <p className="text-sm text-slate-700">
        Best hours to swipe in Windsor: 7am to 10pm. After that, save the chat for morning.
      </p>
    </AppShell>
  );
}
