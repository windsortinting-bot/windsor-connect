import { supabase } from "./supabaseClient";

export async function isBlockedEitherWay(userId: string, otherId: string): Promise<boolean> {
  const { data } = await supabase
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${userId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${userId})`
    )
    .limit(1);

  return (data || []).length > 0;
}