import { supabase } from "./supabaseClient";

export async function blockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase.from("blocks").upsert(
    {
      blocker_id: blockerId,
      blocked_id: blockedId,
    },
    { onConflict: "blocker_id,blocked_id" }
  );
  if (error) throw error;

  // Remove existing matches between the two
  const { data: matches } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id")
    .or(
      `and(user1_id.eq.${blockerId},user2_id.eq.${blockedId}),and(user1_id.eq.${blockedId},user2_id.eq.${blockerId})`
    );

  if (matches?.length) {
    const ids = matches.map((m) => m.id);
    await supabase.from("matches").delete().in("id", ids);
  }
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);
  if (error) throw error;
}

export async function listBlockedProfiles(blockerId: string) {
  const { data: rows, error } = await supabase
    .from("blocks")
    .select("blocked_id, created_at")
    .eq("blocker_id", blockerId)
    .order("created_at", { ascending: false });

  if (error || !rows?.length) return [];

  const ids = rows.map((r) => r.blocked_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, age, photo_urls, neighborhood")
    .in("id", ids);

  return (profiles || []).map((p) => ({
    ...p,
    blocked_at: rows.find((r) => r.blocked_id === p.id)?.created_at || null,
  }));
}