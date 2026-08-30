import { supabase } from "./supabaseClient";

export async function requireAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!data?.is_admin) throw new Error("Admin only");
  return user;
}

export async function setBanned(
  userId: string,
  banned: boolean,
  reason?: string
) {
  await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: banned,
      ban_reason: banned ? reason || "Admin ban" : null,
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function setPaused(userId: string, paused: boolean) {
  await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ is_paused: paused })
    .eq("id", userId);

  if (error) throw error;
}