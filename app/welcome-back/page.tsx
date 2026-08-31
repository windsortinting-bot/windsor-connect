"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function WelcomeBackPage() {
  const router = useRouter();
  const [name, setName] = useState("there");

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.first_name) setName(data.first_name);
    };
    run();
  }, [router]);

  return (
    <AppShell title="Welcome back">
      <p className="text-lg font-semibold mb-4">Hey {name}.</p>
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
          onClick={() => router.push("/matches")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Matches
        </button>
        <button
          type="button"
          onClick={() => router.push("/testers")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Tester list
        </button>
        <button
          type="button"
          onClick={() => router.push("/smoke")}
          className="w-full bg-white border border-slate-200 py-3 rounded-xl"
        >
          Smoke test
        </button>
      </div>
    </AppShell>
  );
}
