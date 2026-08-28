import { supabase } from "./supabaseClient";

export async function loadStarters(neighborhood?: string | null): Promise<string[]> {
  let query = supabase
    .from("conversation_starters")
    .select("prompt, neighborhood")
    .eq("is_active", true)
    .limit(20);

  const { data } = await query;
  const rows = data || [];

  const local = rows
    .filter((r) => neighborhood && r.neighborhood === neighborhood)
    .map((r) => r.prompt);
  const general = rows.filter((r) => !r.neighborhood).map((r) => r.prompt);

  return [...local, ...general].slice(0, 6);
}