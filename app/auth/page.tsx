"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "confirm") {
      setMessage(
        "Email confirmation failed. Try signing in or request a new link."
      );
      setStatus("error");
    }
    const code = params.get("code");
    if (code) {
      setInviteCode(code.toUpperCase());
      setIsLogin(false);
    }
  }, []);

  const validateInviteCode = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) {
      return { ok: false as const, error: "Invite code required for signup" };
    }

    const { data, error } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return { ok: false as const, error: "Invalid invite code" };
    }
    if (data.used_count >= data.max_uses) {
      return { ok: false as const, error: "This invite code is full" };
    }
    return { ok: true as const, row: data };
  };

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
        .update({
          last_active_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        })
        .eq("id", userId);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded, seen_welcome")
        .eq("id", userId)
        .single();

      setStatus("success");
      setMessage("Logged in successfully!");

      // After login: incomplete profile → onboarding, otherwise → profile page
      if (!profile?.is_onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/profile");
      }
    } else {
      const check = await validateInviteCode(inviteCode);
      if (!check.ok) {
        setStatus("error");
        setMessage(check.error || "Invalid code");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { first_name: firstName.trim() },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      const userId = data.user?.id;
      const code = inviteCode.trim().toUpperCase();

      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          first_name: firstName.trim(),
          city: "Windsor",
          is_onboarded: false,
          seen_welcome: false,
          invite_code: code,
        });

        if (check.row) {
          await supabase
            .from("invite_codes")
            .update({ used_count: (check.row.used_count || 0) + 1 })
            .eq("id", check.row.id);
        }
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
            {isLogin ? "Welcome back" : "Join with an invite code"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
              />
              <input
                type="text"
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500 tracking-wider"
              />
            </>
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

        {isLogin && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              Forgot password?
            </button>
          </div>
        )}

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
          <button
            onClick={() => router.push("/terms")}
            className="hover:text-slate-400"
          >
            Terms
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="hover:text-slate-400"
          >
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