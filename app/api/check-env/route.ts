import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    isDefined: !!process.env.NEXT_PUBLIC_BACKEND_URL,
    allEnvKeys: Object.keys(process.env).filter((key) =>
      key.startsWith("NEXT_PUBLIC"),
    ),
  });
}
