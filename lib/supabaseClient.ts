import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ||
  ""
).trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  ""
).trim();

export const hasSupabaseEnv = Boolean(
  supabaseUrl.startsWith("https://") &&
    supabaseUrl.includes(".supabase.co") &&
    supabaseAnonKey.startsWith("eyJ") &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseAnonKey.includes("placeholder")
);

export const supabase = createClient(
  hasSupabaseEnv ? supabaseUrl : "https://placeholder.supabase.co",
  hasSupabaseEnv ? supabaseAnonKey : "placeholder-anon-key",
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
    return "Cannot sign in. Supabase environment variables are missing on this deployment.";
  }

  if (/failed to fetch/i.test(raw)) {
    return "Failed to reach Supabase. Check the Project URL and that this website is allowed in Supabase Auth URL settings.";
  }

  return raw || "Could not sign in.";
}