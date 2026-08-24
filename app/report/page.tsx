"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { createReport } from "../../lib/reports";
import { ArrowLeft } from "lucide-react";

const REASONS = [
  "Fake profile / catfish",
  "Harassment",
  "Spam or scams",
  "Inappropriate photos",
  "Underage concern",
  "Other",
];

export default function ReportPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [reportedId, setReportedId] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      if (typeof window !== "undefined") {
        const id = new URLSearchParams(window.location.search).get("userId");
        if (id) setReportedId(id);
      }
    };
    init();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !reportedId.trim()) {
      setStatus("error");
      setMessage("Missing user to report");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await createReport({
        reporterId: userId,
        reportedId: reportedId.trim(),
        reason,
        details: details.trim() || undefined,
      });
      setStatus("success");
      setMessage("Report submitted. Thank you.");
      setDetails("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Could not submit report");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Report a user</h1>
        <p className="text-slate-500 text-sm mb-8">
          Reports are reviewed by admins
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            value={reportedId}
            onChange={(e) => setReportedId(e.target.value)}
            placeholder="User ID being reported"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />

          <div className="space-y-2">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                  reason === r
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Optional details"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Submitting..." : "Submit report"}
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