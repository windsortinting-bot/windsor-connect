import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: "windsor-connect",
    version: "0.2.0",
    softLaunch: true,
    time: new Date().toISOString(),
  });
}