"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import {
  explainFetchError,
  hasSupabaseEnv,
  supabase,
} from "../../lib/supabaseClient";

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

    if (!hasSupabaseEnv) {
      setStatus("error");
      setMessage(
        "This site is missing Supabase keys. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy."
      );
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "confirm") {
      setMessage("Email confirmation failed. Try signing in again.");
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
      return { ok: false as const, error: error?.message || "Invalid invite code" };
    }

    const used = Number(data.used_count ?? data.uses ?? 0);
    const max = Number(data.max_uses ?? 1);
    if (used >= max) {
      return { ok: false as const, error: "This invite code is full" };
    }
    return { ok: true as const, row: data };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!hasSupabaseEnv) {
      setStatus("error");
      setMessage(
        "Cannot sign in. Supabase environment variables are missing on this deployment."
      );
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setStatus("error");
          setMessage(explainFetchError(error));
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
          })
          .eq("id", userId);

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_onboarded")
          .eq("id", userId)
          .maybeSingle();

        setStatus("success");
        setMessage("Logged in successfully!");

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
                ? `${window.location.origin}/auth`
                : undefined,
          },
        });

        if (error) {
          setStatus("error");
          setMessage(explainFetchError(error));
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
            invite_code: code,
          });
        }

        setStatus("success");
        setMessage(
          "Account created. Check your email if confirmation is required, then sign in."
        );
        setIsLogin(true);
      }
    } catch (err) {
      setStatus("error");
      setMessage(explainFetchError(err));
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
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
              />
              <input
                id="inviteCode"
                name="inviteCode"
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
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-rose-500"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
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
            type="button"
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
      </div>
    </div>
  );
}