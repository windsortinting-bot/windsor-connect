import { supabase } from "./supabaseClient";

let lastSent = 0;

export async function pingActive(userId: string) {
  const now = Date.now();
  if (now - lastSent < 60_000) return;
  lastSent = now;

  await supabase
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", userId);
}