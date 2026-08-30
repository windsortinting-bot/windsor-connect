import { supabase } from "./supabaseClient";

export type AfterMatchSteps = {
  match_id: string;
  first_message_sent: boolean;
  plan_suggested: boolean;
  safety_noted: boolean;
};

export async function loadAfterMatchSteps(
  userId: string,
  matchId: string
): Promise<AfterMatchSteps> {
  const { data } = await supabase
    .from("after_match_steps")
    .select("match_id, first_message_sent, plan_suggested, safety_noted")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();

  return {
    match_id: matchId,
    first_message_sent: !!data?.first_message_sent,
    plan_suggested: !!data?.plan_suggested,
    safety_noted: !!data?.safety_noted,
  };
}

export async function saveAfterMatchSteps(
  userId: string,
  steps: AfterMatchSteps
) {
  const { error } = await supabase.from("after_match_steps").upsert({
    user_id: userId,
    match_id: steps.match_id,
    first_message_sent: steps.first_message_sent,
    plan_suggested: steps.plan_suggested,
    safety_noted: steps.safety_noted,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}