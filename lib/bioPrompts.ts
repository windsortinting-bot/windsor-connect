import { supabase } from "./supabaseClient";

export async function loadBioPrompts(): Promise<string[]> {
  const { data, error } = await supabase
    .from("bio_prompts")
    .select("prompt")
    .eq("is_active", true)
    .limit(20);

  if (error) throw error;
  return (data || []).map((r) => r.prompt);
}