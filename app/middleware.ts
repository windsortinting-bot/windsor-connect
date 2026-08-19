import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_PATHS = [
  "/",
  "/auth",
  "/terms",
  "/privacy",
  "/help",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api");

  if (isPublic) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.next();
  }

  // Lightweight session check via cookie presence
  // (Full server client is heavier; this blocks obvious anonymous access)
  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get(
      `sb-${supabaseUrl.split("//")[1]?.split(".")[0]}-auth-token`
    )?.value;

  // Also check for any sb-*-auth-token cookie pattern
  const hasSupabaseCookie = req.cookies
    .getAll()
    .some(
      (c) =>
        c.name.includes("auth-token") ||
        c.name.startsWith("sb-")
    );

  if (!hasSupabaseCookie && !accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};