import { supabase } from "./supabaseClient";

export type ChatMessage = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
  pending?: boolean;
  failed?: boolean;
};

export function normalizeMessage(row: any): ChatMessage {
  return {
    id: row.id,
    match_id: row.match_id,
    sender_id: row.sender_id,
    body: row.body || row.content || "",
    created_at: row.created_at,
    read_at: row.read_at ?? null,
    pending: false,
    failed: false,
  };
}

export async function loadMessages(matchId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, body, content, created_at, read_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeMessage);
}

export async function sendMessage(params: {
  matchId: string;
  senderId: string;
  text: string;
}): Promise<ChatMessage> {
  const { matchId, senderId, text } = params;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: senderId,
      body: text,
      content: text,
    })
    .select("id, match_id, sender_id, body, content, created_at, read_at")
    .single();

  if (error) throw error;
  return normalizeMessage(data);
}

export async function markIncomingRead(matchId: string, userId: string) {
  const now = new Date().toISOString();
  await supabase
    .from("messages")
    .update({ read_at: now })
    .eq("match_id", matchId)
    .neq("sender_id", userId)
    .is("read_at", null);
}

export async function getMatchParticipant(
  matchId: string,
  userId: string
): Promise<{ otherId: string; otherName: string } | null> {
  const { data: match } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) return null;
  if (match.user1_id !== userId && match.user2_id !== userId) return null;

  const otherId = match.user1_id === userId ? match.user2_id : match.user1_id;
  const { data: other } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", otherId)
    .single();

  return { otherId, otherName: other?.first_name || "Match" };
}