import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPartnersConfig, savePartnersConfig } from "@/lib/partners-config";
import { normalizePublicMediaUrl } from "@/lib/resolve-media-url";
import type { PartnersConfig } from "@/lib/partners-config-defaults";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(await getPartnersConfig());
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: PartnersConfig;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const partners = Array.isArray(body.partners) ? body.partners : [];
  if (partners.length === 0) {
    return NextResponse.json({ error: "Add at least one partner logo." }, { status: 400 });
  }

  const cleanedPartners = [];
  for (let index = 0; index < partners.length; index++) {
    const partner = partners[index];
    const logo = normalizePublicMediaUrl(partner.logoUrl, "Partner logo URL");
    if (!logo.ok) {
      return NextResponse.json({ error: logo.message }, { status: 400 });
    }
    cleanedPartners.push({
      id: partner.id?.trim() || `partner-${index + 1}`,
      name: partner.name?.trim() || `Partner ${index + 1}`,
      logoUrl: logo.value ?? "",
    });
  }

  try {
    const saved = await savePartnersConfig({
      eyebrow: body.eyebrow?.trim() || "Partners we collaborate",
      title: body.title?.trim() || "Trusted learning collaborators",
      partners: cleanedPartners,
    });
    return NextResponse.json(saved);
  } catch (e) {
    console.error("partners-config save error:", e);
    return NextResponse.json({ error: "Failed to save partners config" }, { status: 500 });
  }
}
