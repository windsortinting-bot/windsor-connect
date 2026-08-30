import { supabase } from "./supabaseClient";

export async function loadTodayPin(userId: string): Promise<string> {
  const { data } = await supabase
    .from("today_pins")
    .select("focus")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.focus || "Send one real message";
}

export async function saveTodayPin(userId: string, focus: string) {
  const { error } = await supabase.from("today_pins").upsert({
    user_id: userId,
    focus,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}