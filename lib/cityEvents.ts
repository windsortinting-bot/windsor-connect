import { supabase } from "./supabaseClient";

export type CityEvent = {
  id: string;
  title: string;
  place: string | null;
  event_date: string | null;
  neighborhood: string | null;
};

export async function loadCityEvents(): Promise<CityEvent[]> {
  const { data, error } = await supabase
    .from("city_events")
    .select("id, title, place, event_date, neighborhood")
    .eq("is_active", true)
    .order("event_date", { ascending: true });

  if (error) throw error;
  return (data || []) as CityEvent[];
}