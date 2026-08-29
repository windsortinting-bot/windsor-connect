import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    ok: true,
    signedIn: !!user,
    userId: user?.id || null,
  });
}