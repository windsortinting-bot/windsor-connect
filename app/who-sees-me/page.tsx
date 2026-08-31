"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function WhoSeesMePage() {
  const router = useRouter();

  return (
    <AppShell title="Who sees you" onBack={() => router.push("/settings")}>
      <p className="text-sm text-slate-700">
        People in Windsor who match your filters can see your profile after you finish onboarding. Blocked people cannot.
      </p>
    </AppShell>
  );
}
