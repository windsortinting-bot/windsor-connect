import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [likes, matches] = await Promise.all([
    supabase
      .from("swipes")
      .select("*", { count: "exact", head: true })
      .eq("target_id", user.id)
      .eq("action", "like"),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
  ]);

  return NextResponse.json({
    userId: user.id,
    likes: likes.count || 0,
    matches: matches.count || 0,
  });
}