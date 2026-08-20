import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const supabase = createClient(url, key);

  const [profiles, matches] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_onboarded", true)
      .eq("is_banned", false),
    supabase.from("matches").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    ok: true,
    onboarded_profiles: profiles.count ?? 0,
    matches: matches.count ?? 0,
    city: "Windsor, ON",
  });
}