import { supabase } from "./supabaseClient";

export type DiscoverProfile = {
  id: string;
  first_name: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  looking_for: string | null;
};

function genderMatchesLookingFor(
  myLookingFor: string | null | undefined,
  theirGender: string | null | undefined
) {
  if (!myLookingFor || myLookingFor === "everyone") return true;
  if (!theirGender) return true;

  const g = theirGender.toLowerCase();
  const lf = myLookingFor.toLowerCase();

  if (lf === "men" || lf === "man") return g === "man" || g === "male";
  if (lf === "women" || lf === "woman") return g === "woman" || g === "female";
  return true;
}

export async function fetchDiscoverProfiles(
  currentUserId: string,
  limit = 20
): Promise<DiscoverProfile[]> {
  const { data: me } = await supabase
    .from("profiles")
    .select("looking_for, gender")
    .eq("id", currentUserId)
    .single();

  const { data: swiped } = await supabase
    .from("swipes")
    .select("target_id")
    .eq("swiper_id", currentUserId);

  const swipedIds = (swiped || []).map((s) => s.target_id);

  const { data: blocksA } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", currentUserId);

  const { data: blocksB } = await supabase
    .from("blocks")
    .select("blocker_id")
    .eq("blocked_id", currentUserId);

  const blockedIds = new Set<string>([
    ...(blocksA || []).map((b) => b.blocked_id),
    ...(blocksB || []).map((b) => b.blocker_id),
  ]);

  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, age, gender, city, neighborhood, bio, photo_urls, looking_for"
    )
    .eq("is_onboarded", true)
    .eq("is_paused", false)
    .eq("is_banned", false)
    .neq("id", currentUserId)
    .order("created_at", { ascending: false })
    .limit(60);

  const { data, error } = await query;

  if (error) {
    console.error("fetchDiscoverProfiles", error);
    return [];
  }

  const filtered = (data as DiscoverProfile[] | null || [])
    .filter((p) => !swipedIds.includes(p.id))
    .filter((p) => !blockedIds.has(p.id))
    .filter((p) => genderMatchesLookingFor(me?.looking_for, p.gender))
    .filter((p) => genderMatchesLookingFor(p.looking_for, me?.gender))
    .slice(0, limit);

  return filtered;
}

export async function fetchIncomingLikes(
  currentUserId: string
): Promise<DiscoverProfile[]> {
  const { data: likes, error } = await supabase
    .from("swipes")
    .select("swiper_id")
    .eq("target_id", currentUserId)
    .eq("action", "like");

  if (error || !likes?.length) return [];

  const ids = likes.map((l) => l.swiper_id);

  const { data: already } = await supabase
    .from("swipes")
    .select("target_id")
    .eq("swiper_id", currentUserId);

  const alreadyIds = new Set((already || []).map((s) => s.target_id));

  const { data: blocksA } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", currentUserId);

  const blockedIds = new Set((blocksA || []).map((b) => b.blocked_id));

  const remaining = ids.filter((id) => !alreadyIds.has(id) && !blockedIds.has(id));
  if (!remaining.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, first_name, age, gender, city, neighborhood, bio, photo_urls, looking_for"
    )
    .in("id", remaining)
    .eq("is_onboarded", true)
    .eq("is_paused", false)
    .eq("is_banned", false);

  return (profiles as DiscoverProfile[]) || [];
}