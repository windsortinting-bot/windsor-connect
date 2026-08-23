import { supabase } from "./supabaseClient";

const DAILY_SWIPE_LIMIT = 30;

export async function ensureDailySwipeBudget(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_swipes_used, daily_swipes_reset_at")
    .eq("id", userId)
    .single();

  let used = profile?.daily_swipes_used ?? 0;
  const resetAt = profile?.daily_swipes_reset_at;

  if (!resetAt || String(resetAt).slice(0, 10) !== today) {
    used = 0;
    await supabase
      .from("profiles")
      .update({
        daily_swipes_used: 0,
        daily_swipes_reset_at: today,
      })
      .eq("id", userId);
  }

  return {
    allowed: used < DAILY_SWIPE_LIMIT,
    used,
    limit: DAILY_SWIPE_LIMIT,
  };
}

export async function incrementDailySwipes(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const budget = await ensureDailySwipeBudget(userId);

  await supabase
    .from("profiles")
    .update({
      daily_swipes_used: budget.used + 1,
      daily_swipes_reset_at: today,
    })
    .eq("id", userId);
}