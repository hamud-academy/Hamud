import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAboutConfig, defaultAboutConfig, type AboutConfig, type AboutFeature } from "@/lib/about-config";

const CONFIG_PATH = path.join(process.cwd(), "data", "about-config.json");

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function normalizeConfig(body: unknown): AboutConfig {
  const d = defaultAboutConfig;
  if (!body || typeof body !== "object") return d;
  const b = body as Record<string, unknown>;
  const featuresRaw = Array.isArray(b.features) ? b.features : d.features;
  const features: AboutFeature[] = featuresRaw.slice(0, 3).map((f: unknown) => {
    const o = (f && typeof f === "object" ? f : {}) as { title?: string; description?: string };
    return {
      title: str(o.title) || "Feature",
      description: str(o.description) || "",
    };
  });
  return {
    heroTagline: str(b.heroTagline) || d.heroTagline,
    heroHeading: str(b.heroHeading) || d.heroHeading,
    heroDescription: str(b.heroDescription) || d.heroDescription,
    heroBackgroundImageUrl: str(b.heroBackgroundImageUrl) ?? d.heroBackgroundImageUrl,
    missionTitle: str(b.missionTitle) || d.missionTitle,
    missionText: str(b.missionText) || d.missionText,
    visionTitle: str(b.visionTitle) || d.visionTitle,
    visionText: str(b.visionText) || d.visionText,
    whyChooseUsTitle: str(b.whyChooseUsTitle) || d.whyChooseUsTitle,
    whyChooseUsIntro: str(b.whyChooseUsIntro) || d.whyChooseUsIntro,
    features: features.length ? features : d.features,
    ctaLabel: str(b.ctaLabel) || d.ctaLabel,
    ctaHref: str(b.ctaHref) || d.ctaHref,
  };
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const config = await getAboutConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const config = normalizeConfig(body);
  try {
    await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (e) {
    console.error("about-config write error:", e);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
  return NextResponse.json(config);
}
