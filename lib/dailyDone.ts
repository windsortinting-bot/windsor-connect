import { supabase } from "./supabaseClient";

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function markDayDone(userId: string, note: string) {
  const { error } = await supabase.from("daily_done").upsert({
    user_id: userId,
    day: todayStamp(),
    note,
  });
  if (error) throw error;
}

export async function loadDayDone(userId: string) {
  const { data } = await supabase
    .from("daily_done")
    .select("note, day")
    .eq("user_id", userId)
    .eq("day", todayStamp())
    .maybeSingle();
  return data;
}