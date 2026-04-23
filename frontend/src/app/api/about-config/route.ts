import { NextResponse } from "next/server";
import { getAboutConfig } from "@/lib/about-config";

export async function GET() {
  const config = await getAboutConfig();
  return NextResponse.json(config);
}
