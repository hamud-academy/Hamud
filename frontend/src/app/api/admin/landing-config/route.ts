import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLandingConfig, defaultLandingConfig, saveLandingConfig } from "@/lib/landing-config";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const config = await getLandingConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  let body: Partial<typeof defaultLandingConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const current = await getLandingConfig();
  if (body.heroImageUrl !== undefined) current.heroImageUrl = body.heroImageUrl == null ? "" : String(body.heroImageUrl).trim();
  if (body.heroTagline !== undefined) current.heroTagline = body.heroTagline == null ? "" : String(body.heroTagline).trim();
  if (body.heroHeading !== undefined) current.heroHeading = body.heroHeading == null ? "" : String(body.heroHeading).trim();
  if (body.heroHeadingHighlight !== undefined) current.heroHeadingHighlight = body.heroHeadingHighlight == null ? "" : String(body.heroHeadingHighlight).trim();
  if (body.heroDescription !== undefined) current.heroDescription = body.heroDescription == null ? "" : String(body.heroDescription).trim();
  if (body.heroStudentCountText !== undefined) current.heroStudentCountText = body.heroStudentCountText == null ? "" : String(body.heroStudentCountText).trim();
  try {
    await saveLandingConfig(current);
  } catch (e) {
    console.error("landing-config save error:", e);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
  return NextResponse.json(current);
}
