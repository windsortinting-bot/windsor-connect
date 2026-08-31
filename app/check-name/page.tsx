"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function CheckNamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

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
    <AppShell title="Check name" onBack={() => router.push("/profile")}>
      <p className="text-sm text-slate-600 mb-2">This is the name people see.</p>
      <p className="text-2xl font-bold mb-6">{name || "No name yet"}</p>
      <button
        type="button"
        onClick={() => {
          setStatus("Open profile to edit.");
          router.push("/profile");
        }}
        className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl"
      >
        Edit profile
      </button>
      {status && <p className="text-sm text-slate-500 mt-3">{status}</p>}
    </AppShell>
  );
}
