"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Check your email for a reset link.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/auth")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>

        <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
        <p className="text-slate-500 text-sm mb-8">
          We’ll email you a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              status === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}