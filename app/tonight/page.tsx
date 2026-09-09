"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const STEPS = [
  {
    title: "1. You, first",
    body: "Sign in. Confirm your profile has a photo, town, and looking-for. Open /admin. If it is locked, set is_admin = true in Supabase.",
  },
  {
    title: "2. Second account",
    body: "Create one more tester with a new email. Use your invite code. Finish their profile with the opposite looking-for so you can see each other.",
  },
  {
    title: "3. The loop that matters",
    body: "A likes B. B should see a New like. B likes back. Both should land in Matches. Send one message each way.",
  },
  {
    title: "4. Ugly cases",
    body: "Try a photo over 5MB. Unmatch. Block. Log out. Sign back in. If any of those fail, write it in /testers before you add features.",
  },
  {
    title: "5. Only then invite friends",
    body: "Do not add 20 people while swipe or chat is broken. Five Windsor people who finish a chat beat fifty who bounce.",
  },
];

export default function TonightPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setReady(true);
    };
    start();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Do this next</h1>
        <p className="text-sm text-slate-500 mb-6">
          No new features until the core loop works on two accounts.
        </p>

        <div className="space-y-3 mb-6">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="font-semibold mb-1">{step.title}</p>
              <p className="text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push("/launch-test")}
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl mb-3"
        >
          Open launch checklist
        </button>
        <button
          type="button"
          onClick={() => router.push("/swipe")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm"
        >
          Go swipe
        </button>
      </div>
    </div>
  );
}
