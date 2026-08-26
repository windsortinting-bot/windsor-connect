import { supabase } from "./supabaseClient";

export async function requireAdmin(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!data?.is_admin) throw new Error("Admin access required");
  return user.id;
}

export async function setBanned(userId: string, banned: boolean, reason?: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: banned,
      banned_at: banned ? new Date().toISOString() : null,
      ban_reason: banned ? reason || "Banned by admin" : null,
      is_paused: banned ? true : undefined,
    })
    .eq("id", userId);

  if (error) throw error;
}