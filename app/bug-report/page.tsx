"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft } from "lucide-react";

export default function BugReportPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [page, setPage] = useState("");
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
      if (typeof window !== "undefined") {
        setPage(window.location.pathname);
      }
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !body.trim()) return;

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("bug_reports").insert({
      user_id: userId,
      page: page.trim() || null,
      body: body.trim(),
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    await trackEvent("bug_reported", { page });
    setStatus("success");
    setMessage("Bug report sent. Thank you.");
    setBody("");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Report a bug</h1>
        <p className="text-slate-500 text-sm mb-8">
          Tell us what broke so we can fix soft-launch issues faster
        </p>

        {message && (
          <p
            className={`mb-4 text-sm rounded-xl px-4 py-3 border ${
              status === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-rose-700 bg-rose-50 border-rose-200"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 block mb-2">Page</label>
            <input
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="text-sm text-slate-500 block mb-2">What happened?</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={6}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
              placeholder="Steps to reproduce, what you expected, what you saw..."
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Sending..." : "Submit bug report"}
          </button>
        </form>
      </div>
    </div>
  );
}