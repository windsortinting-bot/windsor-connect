import { supabase } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function joinPresence(
  room: string,
  userId: string,
  onSync: (onlineIds: string[]) => void
): RealtimeChannel {
  const channel = supabase.channel(room, {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const ids = Object.keys(state);
      onSync(ids);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ userId, at: Date.now() });
      }
    });

  return channel;
}