import { supabase } from "./supabaseClient";

export async function createReport(params: {
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
}) {
  const { reporterId, reportedId, reason, details } = params;
  const text = details ? `${reason}: ${details}` : reason;

  const first = await supabase.from("reports").insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason: text,
  });

  if (!first.error) return;

  const second = await supabase.from("reports").insert({
    reporter_id: reporterId,
    reported_id: reportedId,
    reason: text,
    status: "open",
  });

  if (second.error) throw first.error || second.error;
}
