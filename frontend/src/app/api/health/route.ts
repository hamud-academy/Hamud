import { NextResponse } from "next/server";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: `${DEFAULT_SITE_NAME} API is running`,
    timestamp: new Date().toISOString(),
  });
}
