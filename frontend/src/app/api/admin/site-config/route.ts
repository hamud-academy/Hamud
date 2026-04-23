import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSiteConfig } from "@/lib/site-config";
import { getSiteBranding, upsertSiteBranding } from "@/lib/site-branding";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");
const defaultConfig = { siteName: "BaroSmart", logoUrl: "", accentSuffix: "" };

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const [config, branding] = await Promise.all([getSiteConfig(), getSiteBranding()]);
  return NextResponse.json({ ...config, ...branding });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  let body: {
    siteName?: string;
    logoUrl?: string;
    accentSuffix?: string;
    faviconUrl?: string | null;
    tabTitle?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.faviconUrl !== undefined || body.tabTitle !== undefined) {
    try {
      await upsertSiteBranding({
        ...(body.faviconUrl !== undefined && { faviconUrl: body.faviconUrl }),
        ...(body.tabTitle !== undefined && { tabTitle: body.tabTitle }),
      });
    } catch (e) {
      console.error("site branding write error:", e);
      const prismaErr = e instanceof Prisma.PrismaClientKnownRequestError ? e : null;
      const message =
        prismaErr?.code === "P2021"
          ? "Database table missing. Run: npx prisma db push (or prisma migrate deploy), then try again."
          : "Failed to save favicon settings";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const hasFileConfigUpdate =
    body.siteName !== undefined || body.logoUrl !== undefined || body.accentSuffix !== undefined;
  let current = await getSiteConfig();
  if (hasFileConfigUpdate) {
    if (body.siteName !== undefined) current.siteName = String(body.siteName).trim() || defaultConfig.siteName;
    if (body.logoUrl !== undefined) current.logoUrl = body.logoUrl == null ? "" : String(body.logoUrl).trim();
    if (body.accentSuffix !== undefined) current.accentSuffix = body.accentSuffix == null ? "" : String(body.accentSuffix).trim();
    try {
      await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
      await writeFile(CONFIG_PATH, JSON.stringify(current, null, 2), "utf-8");
    } catch (e) {
      console.error("site-config write error:", e);
      return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
  }

  const branding = await getSiteBranding();
  return NextResponse.json({ ...current, ...branding });
}
