import { supabase } from "./supabaseClient";

export async function createMatchSafe(userA: string, userB: string) {
  const { data, error } = await supabase.rpc("create_match_safe", {
    a: userA,
    b: userB,
  });

  if (error) {
    return { matchId: null as string | null, error };
  }

  return { matchId: (data as string) || null, error: null };
}