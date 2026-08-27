import { supabase } from "./supabaseClient";
import { ROUTES } from "./routes";

export type AccountState = {
  userId: string;
  email: string | null;
  isAdmin: boolean;
  isOnboarded: boolean;
  isPaused: boolean;
  isBanned: boolean;
  firstName: string | null;
};

export async function getAccountState(): Promise<AccountState | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, is_admin, is_onboarded, is_paused, is_banned")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    isAdmin: !!profile?.is_admin,
    isOnboarded: !!profile?.is_onboarded,
    isPaused: !!profile?.is_paused,
    isBanned: !!profile?.is_banned,
    firstName: profile?.first_name ?? null,
  };
}

export function nextRouteForAccount(account: AccountState | null): string {
  if (!account) return ROUTES.auth;
  if (account.isBanned) return ROUTES.banned;
  if (!account.isOnboarded) return ROUTES.notReady;
  if (account.isPaused) return ROUTES.paused;
  return ROUTES.swipe;
}