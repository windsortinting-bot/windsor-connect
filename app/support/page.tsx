"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      setEmail(user.email || "");
    };
    load();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !subject.trim() || !body.trim()) return;

    setStatus("loading");
    setMessage("");

    let { error } = await supabase.from("support_tickets").insert({
      user_id: userId,
      email,
      subject: subject.trim(),
      body: body.trim(),
    });

    if (error && /status/i.test(error.message)) {
      const retry = await supabase.from("support_tickets").insert({
        user_id: userId,
        email,
        subject: subject.trim(),
        body: body.trim(),
        status: "open",
      });
      error = retry.error;
    }

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Ticket sent. We’ll reply to this email.");
    setSubject("");
    setBody("");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-slate-500 text-sm mb-8">
          Tell us what broke. Use the email you signed up with.
        </p>

        {status === "success" && (
          <div className="mb-6 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 rounded-2xl px-4 py-4">
            <p className="text-lg font-bold">Ticket sent</p>
            <p className="text-sm mt-1">
              We got it. Check this email if we need more info.
            </p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What happened?"
            required
            rows={5}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Sending..." : "Send ticket"}
          </button>
        </form>

        {status === "error" && message && (
          <p className="mt-4 text-sm rounded-xl px-4 py-3 border text-rose-700 bg-rose-50 border-rose-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
