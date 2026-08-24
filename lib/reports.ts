import { supabase } from "./supabaseClient";

export async function createReport(params: {
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
}) {
  const { reporterId, reportedId, reason, details } = params;

  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason: details ? `${reason}: ${details}` : reason,
    status: "open",
  });

  if (error) throw error;
}