"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [cheer, setCheer] = useState("");

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
      setMessage("Email confirmation failed. Try Sign in, or resend the email.");
      setStatus("error");
    }
    const code = params.get("code");
    if (code && code.length <= 24) {
      setInviteCode(code.toUpperCase());
      setIsLogin(false);
    }

    const hash = window.location.hash.replace("#", "");
    const hashParams = new URLSearchParams(hash);
    if (hashParams.get("type") === "signup" || hashParams.get("access_token")) {
      setMessage("Email confirmed. Sign in with your password.");
      setStatus("success");
      setIsLogin(true);
    }
  }, []);

  const validateInviteCode = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) {
      return { ok: false as const, error: "Invite code required to create an account" };
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

  const resendConfirm = async () => {
    if (!email.trim()) {
      setStatus("error");
      setMessage("Enter your email first, then tap Resend confirmation.");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
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
    setStatus("success");
    setMessage("Confirmation email sent. Check inbox and spam, then sign in.");
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
          const text = error.message || "";
          if (text.toLowerCase().includes("email not confirmed")) {
            setStatus("error");
            setMessage(
              "Your email is not confirmed yet. Open the email from Supabase, or tap Resend confirmation below."
            );
            return;
          }
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

        if (data.session) {
          setStatus("success");
          setMessage("Account created. Continue to your profile.");
          setCheer("You’re in. Good start — now add a photo and finish your profile.");
          window.setTimeout(() => router.push("/onboarding"), 900);
          return;
        }

        setStatus("success");
        setMessage(
          "Account created. Check your email for a Confirm link. Then come back here and Sign in."
        );
        setCheer("Nice. Confirm the email, then come back and sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      setStatus("error");
      setMessage(explainFetchError(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {cheer && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto bg-rose-100 text-rose-950 border border-rose-200 rounded-2xl px-4 py-3 text-sm shadow-lg">
          {cheer}
        </div>
      )}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Windsor Connect</h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? "Sign in to your account" : "Create an account with your invite code"}
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 pr-12 rounded-xl outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-60"
          >
            {status === "loading"
              ? "Please wait..."
              : isLogin
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        {isLogin && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-slate-500 hover:text-slate-300"
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={resendConfirm}
              className="text-slate-500 hover:text-slate-300"
            >
              Resend confirmation
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
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
