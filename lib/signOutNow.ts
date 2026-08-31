import { supabase } from "./supabaseClient";

export async function signOutNow() {
  await supabase.auth.signOut();
}
