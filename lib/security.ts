import { supabase } from "./supabaseClient";

export async function logSecurityEvent(
  eventName: string,
  meta: Record<string, unknown> = {}
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("security_events").insert({
      user_id: user.id,
      event_name: eventName,
      meta,
    });
  } catch {
    // never block UI
  }
}