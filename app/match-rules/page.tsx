"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MATCH_RULES } from "../../lib/matchRules";
import AppShell from "../components/AppShell";

export default function MatchRulesPage() {
  const router = useRouter();

  return (
    <AppShell title="Match rules" onBack={() => router.push("/matches")}>
      <div className="space-y-2">
        {MATCH_RULES.map((rule) => (
          <div key={rule} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
            {rule}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
