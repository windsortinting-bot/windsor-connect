"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const STEPS = [
  "Two accounts can like, match, and chat",
  "Block and report work",
  "Admin can open reports, tickets, and tester notes",
  "Invite code works for a new person",
  "Your own profile has a photo and town",
  "You invited 5 real Windsor-area people",
];

export default function GoLivePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const start = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      try {
        const raw = localStorage.getItem("windsor-go-live");
        if (raw) setDone(JSON.parse(raw));
      } catch {
        setDone({});
      }
      setReady(true);
    };
    start();
  }, [router]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      localStorage.setItem("windsor-go-live", JSON.stringify(next));
      return next;
    });
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  const count = STEPS.filter((_, i) => done[i]).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>
        <h1 className="text-3xl font-bold mb-2">Go live</h1>
        <p className="text-sm text-slate-500 mb-6">
          {count} of {STEPS.length}. When this is done, stop building and talk to people.
        </p>
        <div className="space-y-2 mb-6">
          {STEPS.map((step, i) => (
            <button
              key={step}
              type="button"
              onClick={() => toggle(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                done[i]
                  ? "bg-rose-100 border-rose-200 text-rose-950"
                  : "bg-white border-slate-200"
              }`}
            >
              {done[i] ? "✓ " : "○ "}
              {step}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => router.push("/invite-text")}
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl"
        >
          Copy invite text
        </button>
      </div>
    </div>
  );
}
