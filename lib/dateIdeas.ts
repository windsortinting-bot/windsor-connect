import { supabase } from "./supabaseClient";

export type DateIdea = {
  id: string;
  title: string;
  neighborhood: string | null;
  cost: string | null;
};

export async function loadDateIdeas(neighborhood?: string | null): Promise<DateIdea[]> {
  const { data, error } = await supabase
    .from("date_ideas")
    .select("id, title, neighborhood, cost")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data || []) as DateIdea[];
  const local = rows.filter((r) => neighborhood && r.neighborhood === neighborhood);
  const general = rows.filter((r) => !neighborhood || r.neighborhood !== neighborhood);
  return [...local, ...general].slice(0, 8);
}