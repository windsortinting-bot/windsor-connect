"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function HomeNowPage() {
  const router = useRouter();
  const [name, setName] = useState("");

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
      setName(data?.first_name || "");
    };
    run();
  }, [router]);

  return (
    <AppShell title={name ? `Hi ${name}` : "Home"}>
      <div className="space-y-2">
        <button type="button" onClick={() => router.push("/swipe")} className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl">
          Swipe
        </button>
        <button type="button" onClick={() => router.push("/matches")} className="w-full bg-white border border-slate-200 py-3 rounded-xl">
          Matches
        </button>
        <button type="button" onClick={() => router.push("/messages")} className="w-full bg-white border border-slate-200 py-3 rounded-xl">
          Messages
        </button>
        <button type="button" onClick={() => router.push("/profile")} className="w-full bg-white border border-slate-200 py-3 rounded-xl">
          Profile
        </button>
      </div>
    </AppShell>
  );
}
