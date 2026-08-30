import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const hasSupabaseEnv = Boolean(
  supabaseUrl.startsWith("https://") &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes("placeholder")
);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function explainFetchError(err: unknown): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message)
      : String(err || "");

  if (!hasSupabaseEnv) {
    return "Login cannot reach the database. NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing on this site.";
  }

  if (/failed to fetch/i.test(raw) || /fetch/i.test(raw)) {
    return "Failed to fetch Supabase. Check the project URL, that this site is allowed, and your internet connection.";
  }

  return raw || "Could not sign in.";
}