import { supabase } from "./supabaseClient";

export async function signOutNow() {
  try {
    await supabase.auth.signOut();
  } catch {
    // Local session may already be gone.
  }
}
