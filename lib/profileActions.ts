import { supabase } from "./supabaseClient";

export async function setPaused(userId: string, paused: boolean) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_paused: paused,
      paused_at: paused ? new Date().toISOString() : null,
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function requestAccountDeletion(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      delete_requested_at: new Date().toISOString(),
      is_paused: true,
      paused_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function saveFilters(params: {
  userId: string;
  lookingFor: string;
  preferredNeighborhoods: string[];
}) {
  const { userId, lookingFor, preferredNeighborhoods } = params;
  const { error } = await supabase
    .from("profiles")
    .update({
      looking_for: lookingFor,
      preferred_neighborhoods: preferredNeighborhoods,
    })
    .eq("id", userId);

  if (error) throw error;
}