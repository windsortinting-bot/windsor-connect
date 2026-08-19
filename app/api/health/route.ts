import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "windsor-connect",
    time: new Date().toISOString(),
  });
}