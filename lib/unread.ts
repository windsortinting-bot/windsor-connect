import { supabase } from "./supabaseClient";

export async function countUnreadMessages(userId: string): Promise<number> {
  const { data: matches } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (!matches?.length) return 0;

  const matchIds = matches.map((m) => m.id);

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("match_id", matchIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("countUnreadMessages", error);
    return 0;
  }

  return count ?? 0;
}

export async function countUnreadForMatch(
  matchId: string,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("match_id", matchId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}