import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getContactConfig, defaultContactConfig, saveContactConfig, type ContactConfig } from "@/lib/contact-config";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const config = await getContactConfig();
  return NextResponse.json(config);
}

function normalizeConfig(body: unknown): ContactConfig {
  const d = defaultContactConfig;
  if (!body || typeof body !== "object") return d;
  const b = body as Record<string, unknown>;
  const str = (v: unknown) => (v == null ? "" : String(v).trim());
  const arr = <T>(v: unknown, def: T[]): T[] => (Array.isArray(v) ? v as T[] : def);
  const normPhones = arr(b.phones, d.phones).map((p: { id?: string; number?: string; callbackLabel?: string }) => ({
    id: str(p.id) || crypto.randomUUID(),
    number: str(p.number),
    callbackLabel: str(p.callbackLabel),
  }));
  const normEmails = arr(b.emails, d.emails).map((e: { id?: string; address?: string; messageLabel?: string }) => ({
    id: str(e.id) || crypto.randomUUID(),
    address: str(e.address),
    messageLabel: str(e.messageLabel),
  }));
  const normHeadOffices = arr(b.headOffices, d.headOffices).map((h: { id?: string; text?: string }) => ({
    id: str(h.id) || crypto.randomUUID(),
    text: str(h.text),
  }));
  const normSocial = arr(b.socialLinks, d.socialLinks).map((s: { id?: string; platform?: string; url?: string }) => ({
    id: str(s.id) || crypto.randomUUID(),
    platform: str(s.platform),
    url: str(s.url),
  }));
  const loc = b.ourLocation && typeof b.ourLocation === "object" ? (b.ourLocation as Record<string, unknown>) : null;
  return {
    getInTouchTitle: str(b.getInTouchTitle) || d.getInTouchTitle,
    getInTouchDescription: str(b.getInTouchDescription) || d.getInTouchDescription,
    phones: normPhones.length ? normPhones : d.phones,
    emails: normEmails.length ? normEmails : d.emails,
    headOffices: normHeadOffices.length ? normHeadOffices : d.headOffices,
    socialLinks: normSocial.length ? normSocial : d.socialLinks,
    ourLocation: {
      title: (loc && str(loc.title)) || d.ourLocation.title,
      description: (loc && str(loc.description)) || d.ourLocation.description,
      mapUrl: (loc && str(loc.mapUrl)) || d.ourLocation.mapUrl,
      mapEmbedCode: (loc && typeof loc.mapEmbedCode === "string") ? loc.mapEmbedCode : (d.ourLocation.mapEmbedCode ?? ""),
    },
  };
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
    await saveContactConfig(config);
  } catch (e) {
    console.error("contact-config write error:", e);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
  return NextResponse.json(config);
}
