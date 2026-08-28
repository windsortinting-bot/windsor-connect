import { supabase } from "./supabaseClient";

export async function fetchDiscoverableProfiles(params: {
  currentUserId: string;
  limit?: number;
}) {
  const limit = params.limit ?? 20;

  const [{ data: blocked }, { data: swiped }] = await Promise.all([
    supabase
      .from("blocks")
      .select("blocked_id, blocker_id")
      .or(`blocker_id.eq.${params.currentUserId},blocked_id.eq.${params.currentUserId}`),
    supabase
      .from("swipes")
      .select("target_id")
      .eq("swiper_id", params.currentUserId),
  ]);

  const skip = new Set<string>([params.currentUserId]);
  (blocked || []).forEach((b: any) => {
    skip.add(b.blocked_id);
    skip.add(b.blocker_id);
  });
  (swiped || []).forEach((s: any) => skip.add(s.target_id));

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, neighborhood, photo_urls, last_active_at, is_onboarded, is_paused, is_banned")
    .eq("is_onboarded", true)
    .neq("id", params.currentUserId)
    .order("last_active_at", { ascending: false, nullsFirst: false })
    .limit(80);

  if (error) throw error;

  return (data || [])
    .filter((p: any) => !p.is_paused && !p.is_banned && !skip.has(p.id))
    .slice(0, limit);
}