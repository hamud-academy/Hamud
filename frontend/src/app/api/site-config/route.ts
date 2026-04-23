import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";
import { getSiteBranding } from "@/lib/site-branding";

export async function GET() {
  const [config, branding] = await Promise.all([getSiteConfig(), getSiteBranding()]);
  return NextResponse.json({ ...config, ...branding });
}
