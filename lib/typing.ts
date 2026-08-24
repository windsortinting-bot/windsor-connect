import { supabase } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function joinTypingChannel(
  matchId: string,
  userId: string,
  onTyping: (fromUserId: string) => void
): RealtimeChannel {
  const channel = supabase.channel(`typing:${matchId}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on("broadcast", { event: "typing" }, ({ payload }) => {
      if (!payload?.userId || payload.userId === userId) return;
      onTyping(payload.userId);
    })
    .subscribe();

  return channel;
}

export async function broadcastTyping(
  channel: RealtimeChannel | null,
  userId: string
) {
  if (!channel) return;
  await channel.send({
    type: "broadcast",
    event: "typing",
    payload: { userId, at: Date.now() },
  });
}