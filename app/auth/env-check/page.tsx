"use client";

import React from "react";
import { hasSupabaseEnv } from "../../../lib/supabaseClient";

export default function EnvCheckPage() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-10">
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-5 text-sm space-y-2">
        <h1 className="text-xl font-bold mb-3">Env check</h1>
        <p>Has usable env: {hasSupabaseEnv ? "yes" : "no"}</p>
        <p>URL starts with https: {url.startsWith("https://") ? "yes" : "no"}</p>
        <p>URL host: {url.includes(".supabase.co") ? "looks like Supabase" : "missing or wrong"}</p>
        <p>Anon key starts with eyJ: {key.startsWith("eyJ") ? "yes" : "no"}</p>
        <p>URL length: {url.length}</p>
        <p>Key length: {key.length}</p>
        <p className="text-slate-500 pt-2">
          If this says no on Vercel, the variables are not on that deployment. Add them and redeploy.
        </p>
      </div>
    </div>
  );
}