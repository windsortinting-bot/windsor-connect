"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "../../../lib/useAccount";
import {
  loadAfterMatchSteps,
  saveAfterMatchSteps,
  type AfterMatchSteps,
} from "../../../lib/afterMatch";
import AppShell from "../../components/AppShell";

export default function AfterMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { account, loading } = useAccount();
  const matchId = String(params.matchId || "");
  const [steps, setSteps] = useState<AfterMatchSteps | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      setSteps(await loadAfterMatchSteps(account.userId, matchId));
    };
    run();
  }, [account, loading, matchId, router]);

  const toggle = async (key: keyof Omit<AfterMatchSteps, "match_id">) => {
    if (!account || !steps) return;
    const next = { ...steps, [key]: !steps[key] };
    setSteps(next);
    await saveAfterMatchSteps(account.userId, next);
    setStatus("Saved");
  };

  return (
    <AppShell title="Match checklist" onBack={() => router.push("/after-match")}>
      {!steps ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggle("first_message_sent")}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left"
          >
            First message sent: {steps.first_message_sent ? "Yes" : "Not yet"}
          </button>
          <button
            type="button"
            onClick={() => toggle("plan_suggested")}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left"
          >
            Suggested a plan: {steps.plan_suggested ? "Yes" : "Not yet"}
          </button>
          <button
            type="button"
            onClick={() => toggle("safety_noted")}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left"
          >
            Safety note done: {steps.safety_noted ? "Yes" : "Not yet"}
          </button>
        </div>
      )}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => router.push(`/chat/${matchId}`)}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Open chat
        </button>
        <button
          type="button"
          onClick={() => router.push("/openers")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Get an opener
        </button>
        <button
          type="button"
          onClick={() => router.push("/plan-text")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Copy a plan
        </button>
        <button
          type="button"
          onClick={() => router.push("/safety-checkin")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Safety check-in
        </button>
      </div>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
    </AppShell>
  );
}