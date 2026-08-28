import { supabase } from "./supabaseClient";
import { firstPhoto } from "./images";

export type InboxThread = {
  matchId: string;
  otherId: string;
  otherName: string;
  photo: string | null;
  lastMessage: string | null;
  lastAt: string | null;
};

export async function loadInbox(userId: string): Promise<InboxThread[]> {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id, created_at")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const seen = new Set<string>();
  const threads: InboxThread[] = [];

  for (const m of matches || []) {
    const otherId = m.user1_id === userId ? m.user2_id : m.user1_id;
    if (seen.has(otherId)) continue;
    seen.add(otherId);

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, photo_urls")
      .eq("id", otherId)
      .maybeSingle();

    const { data: lastRows } = await supabase
      .from("messages")
      .select("body, content, created_at")
      .eq("match_id", m.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const last = lastRows?.[0];

    threads.push({
      matchId: m.id,
      otherId,
      otherName: profile?.first_name || "Match",
      photo: firstPhoto(profile?.photo_urls),
      lastMessage: last?.body || last?.content || null,
      lastAt: last?.created_at || m.created_at,
    });
  }

  threads.sort((a, b) => {
    const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
    const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
    return tb - ta;
  });

  return threads;
}