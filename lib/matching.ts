import { supabase } from "./supabaseClient";

export async function recordSwipe(
  swiperId: string,
  targetId: string,
  action: "like" | "pass" | "superlike"
) {
  const { error } = await supabase.from("swipes").upsert(
    {
      swiper_id: swiperId,
      target_id: targetId,
      action,
    },
    { onConflict: "swiper_id,target_id" }
  );

  if (error) throw error;
}

export async function checkMutualLike(
  swiperId: string,
  targetId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("swipes")
    .select("id")
    .eq("swiper_id", targetId)
    .eq("target_id", swiperId)
    .eq("action", "like")
    .maybeSingle();

  if (error) {
    console.error("checkMutualLike", error);
    return false;
  }

  return !!data;
}

export async function createMatchSafe(
  userA: string,
  userB: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("create_match_safe", {
    a: userA,
    b: userB,
  });

  if (error) {
    console.error("create_match_safe", error);
    return null;
  }

  return (data as string) || null;
}

export async function unmatchSafe(
  matchId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("unmatch_safe", {
    p_match_id: matchId,
    p_user_id: userId,
  });

  if (error) {
    console.error("unmatch_safe", error);
    return false;
  }

  return !!data;
}

export async function getUniqueMatchCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (error || !data) return 0;

  const partners = new Set<string>();
  for (const m of data) {
    const other = m.user1_id === userId ? m.user2_id : m.user1_id;
    partners.add(other);
  }
  return partners.size;
}