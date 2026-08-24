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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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

    const { error } = await supabase.from("support_tickets").insert({
      user_id: userId,
      email,
      subject: subject.trim(),
      body: body.trim(),
      status: "open",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Support ticket sent.");
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
        <p className="text-slate-500 text-sm mb-8">We read every ticket</p>

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
            placeholder="How can we help?"
            required
            rows={5}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Sending..." : "Send ticket"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm rounded-xl px-4 py-3 border ${
              status === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-rose-700 bg-rose-50 border-rose-200"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}