import { supabase } from "./supabaseClient";

export type DuplicateMatch = {
  pairKey: string;
  ids: string[];
  user1_id: string;
  user2_id: string;
};

export async function findDuplicateMatches(): Promise<DuplicateMatch[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id");

  if (error) throw error;

  const groups = new Map<string, DuplicateMatch>();
  for (const row of data || []) {
    const a = row.user1_id < row.user2_id ? row.user1_id : row.user2_id;
    const b = row.user1_id < row.user2_id ? row.user2_id : row.user1_id;
    const pairKey = `${a}:${b}`;
    const current = groups.get(pairKey);
    if (current) {
      current.ids.push(row.id);
    } else {
      groups.set(pairKey, {
        pairKey,
        ids: [row.id],
        user1_id: a,
        user2_id: b,
      });
    }
  }

  return [...groups.values()].filter((g) => g.ids.length > 1);
}