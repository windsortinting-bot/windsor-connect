import { supabase } from "./supabaseClient";

export async function muteMatch(userId: string, matchId: string) {
  const { error } = await supabase
    .from("muted_matches")
    .upsert({ user_id: userId, match_id: matchId });
  if (error) throw error;
}

export async function unmuteMatch(userId: string, matchId: string) {
  const { error } = await supabase
    .from("muted_matches")
    .delete()
    .eq("user_id", userId)
    .eq("match_id", matchId);
  if (error) throw error;
}

export async function listMutedMatchIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("muted_matches")
    .select("match_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((r) => r.match_id);
}