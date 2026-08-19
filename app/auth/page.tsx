"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setStatus("error");
        setMessage("Could not load user.");
        return;
      }

      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", userId);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded")
        .eq("id", userId)
        .single();

      setStatus("success");
      setMessage("Logged in successfully!");

      if (profile?.is_onboarded) {
        router.push("/swipe");
      } else {
        router.push("/onboarding");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { first_name: firstName.trim() },
        },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      const userId = data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          first_name: firstName.trim(),
          city: "Windsor",
          is_onboarded: false,
        });
      }

      setStatus("success");
      setMessage(
        "Account created. Check your email to confirm if required, then sign in."
      );
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Windsor Connect</h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? "Welcome back" : "Join the 519 community"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-60"
          >
            {status === "loading"
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              status === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setStatus("idle");
            }}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isLogin
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-4 text-xs text-slate-600">
          <button onClick={() => router.push("/terms")} className="hover:text-slate-400">
            Terms
          </button>
          <button onClick={() => router.push("/privacy")} className="hover:text-slate-400">
            Privacy
          </button>
          <button onClick={() => router.push("/")} className="hover:text-slate-400">
            Home
          </button>
        </div>
      </div>
    </div>
  );
}