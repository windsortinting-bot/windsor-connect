"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function GoPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setReady(true);
    };
    run();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <AppShell title="Quick start" onBack={() => router.push("/profile")}>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/swipe")}
          className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
        >
          Swipe
        </button>
        <button
          type="button"
          onClick={() => router.push("/likes")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Likes
        </button>
        <button
          type="button"
          onClick={() => router.push("/matches")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Matches
        </button>
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Profile
        </button>
      </div>
    </AppShell>
  );
}
