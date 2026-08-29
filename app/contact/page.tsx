"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { supabase } from "../../lib/supabaseClient";
import AppShell from "../components/AppShell";

export default function ContactPage() {
  const router = useRouter();
  const { account } = useAccount();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  const send = async () => {
    if (!account) {
      router.push("/auth");
      return;
    }
    if (!body.trim()) return;
    const { error } = await supabase.from("support_tickets").insert({
      user_id: account.userId,
      message: body.trim(),
      status: "open",
    });
    setStatus(error ? error.message : "Sent");
    if (!error) setBody("");
  };

  return (
    <AppShell title="Contact" onBack={() => router.push("/support")}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What do you need help with?"
        className="w-full min-h-32 bg-white border border-slate-200 rounded-xl p-3 text-sm"
      />
      <button
        type="button"
        onClick={send}
        className="w-full mt-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Send
      </button>
      {status && <p className="text-sm mt-3">{status}</p>}
      <p className="text-xs text-slate-400 mt-4">
        If support_tickets is missing, use /support instead.
      </p>
    </AppShell>
  );
}