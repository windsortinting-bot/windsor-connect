"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setEmail(user.email || "");
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("support_messages").insert({
      user_id: userId,
      email: email.trim() || null,
      subject: subject.trim(),
      body: body.trim(),
      status: "open",
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    await trackEvent("support_submitted", { subject: subject.trim() });
    setStatus("success");
    setMessage("Message sent. We’ll review it soon.");
    setSubject("");
    setBody("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-slate-500 text-sm mb-8">
          Questions, bugs, or safety concerns
        </p>

        {message && (
          <p
            className={`mb-4 text-sm rounded-xl px-4 py-3 border ${
              status === "success"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={120}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              maxLength={2000}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}