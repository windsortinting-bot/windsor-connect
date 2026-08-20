"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Password updated. Redirecting...");
    setTimeout(() => router.push("/swipe"), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Set new password</h1>
        <p className="text-slate-500 text-sm mb-8">
          Choose a new password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
          />
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Saving..." : "Update password"}
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