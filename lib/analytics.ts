import { supabase } from "./supabaseClient";

export async function trackEvent(
  eventName: string,
  meta: Record<string, unknown> = {}
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("app_events").insert({
      user_id: user?.id ?? null,
      event_name: eventName,
      meta,
    });
  } catch {
    // never block UI for analytics
  }
}