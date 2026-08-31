"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

const CHECKS = [
  "You have talked for more than a few messages.",
  "You picked a public place.",
  "You told someone where you will be.",
  "You have your own ride home.",
];

export default function ReadyToMeetPage() {
  const router = useRouter();

  return (
    <AppShell title="Ready to meet?" onBack={() => router.push("/after-chat")}>
      <ul className="text-sm text-slate-700 space-y-2">
        {CHECKS.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </AppShell>
  );
}
