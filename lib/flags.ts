import { supabase } from "./supabaseClient";

export async function getFlag(key: string, fallback = false): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) return fallback;
    return !!data.enabled;
  } catch {
    return fallback;
  }
}

export async function getFlags(): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("key, enabled");

    if (error || !data) return {};
    const out: Record<string, boolean> = {};
    for (const row of data) out[row.key] = !!row.enabled;
    return out;
  } catch {
    return {};
  }
}