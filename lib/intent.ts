import { supabase } from "./supabaseClient";

export const INTENT_OPTIONS = [
  "Serious",
  "Seeing what happens",
  "New friends first",
  "Not sure yet",
];

export async function saveIntent(userId: string, intent: string) {
  const { error } = await supabase.from("intent_choices").upsert({
    user_id: userId,
    intent,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadIntent(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("intent_choices")
    .select("intent")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.intent || null;
}