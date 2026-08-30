import { supabase } from "./supabaseClient";
import { profileCompleteness } from "./completeness";

export type NextAction = {
  label: string;
  href: string;
  reason: string;
};

export async function getNextAction(userId: string): Promise<NextAction> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, age, bio, photo_urls, neighborhood, is_onboarded")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    return {
      label: "Finish your profile",
      href: "/onboarding",
      reason: "People cannot find you until this is done.",
    };
  }

  const gaps = profileCompleteness(profile);
  if (gaps.missing.includes("photo")) {
    return {
      label: "Add a photo",
      href: "/photo-check",
      reason: "No photo is the fastest way to get passed.",
    };
  }
  if (gaps.missing.includes("bio")) {
    return {
      label: "Write a short bio",
      href: "/bio-help",
      reason: "Give people one thing to answer.",
    };
  }

  const { count: matchCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if ((matchCount || 0) > 0) {
    return {
      label: "Message a match",
      href: "/after-match",
      reason: "A match dies if nobody says something real.",
    };
  }

  return {
    label: "Start swiping",
    href: "/swipe",
    reason: "Your profile is ready enough to meet people.",
  };
}