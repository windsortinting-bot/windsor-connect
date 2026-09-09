"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const ITEMS = [
  { id: "signin", label: "Sign in with a real email and password" },
  { id: "photo", label: "Upload a profile photo under 5MB" },
  { id: "profile", label: "Finish name, age, town, and looking-for" },
  { id: "second", label: "Sign in on a second test account" },
  { id: "swipe", label: "Second account appears on swipe" },
  { id: "like", label: "Account A likes account B" },
  { id: "likes-tab", label: "B sees A under New likes" },
  { id: "match", label: "B likes back and both see the match" },
  { id: "badge", label: "Matches icon count updates without refresh" },
  { id: "chat", label: "Send a message. It shows Sending then Sent" },
  { id: "reply", label: "Other account can reply in the same thread" },
  { id: "unmatch", label: "Unmatch removes them from Matches" },
  { id: "block", label: "Block hides them from swipe" },
  { id: "logout", label: "Log out returns you to sign in" },
  { id: "invite", label: "A new invite code lets a third person join" },
];

export default function LaunchTestPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

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
        const raw = localStorage.getItem("windsor-launch-test");
        if (raw) setDone(JSON.parse(raw));
      } catch {
        setDone({});
      }
      setReady(true);
    };
    start();
  }, [router]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("windsor-launch-test", JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem("windsor-launch-test");
    setDone({});
  };

  const finished = ITEMS.filter((i) => done[i.id]).length;

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading test list...
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

        <h1 className="text-3xl font-bold mb-2">Launch test</h1>
        <p className="text-sm text-slate-500 mb-6">
          {finished} of {ITEMS.length} checked. Use two phones or two browsers.
        </p>

        <div className="space-y-2 mb-6">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                done[item.id]
                  ? "bg-rose-100 border-rose-200 text-rose-950"
                  : "bg-white border-slate-200"
              }`}
            >
              {done[item.id] ? "✓ " : "○ "}
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={reset}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl text-sm"
        >
          Clear checks
        </button>
      </div>
    </div>
  );
}
