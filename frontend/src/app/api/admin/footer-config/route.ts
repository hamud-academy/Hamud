import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFooterConfig, saveFooterConfig, normalizeFooterConfig } from "@/lib/footer-config";

function isAdmin(role?: string) {
  return role === "ADMIN";
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const config = await getFooterConfig();
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!isAdmin(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const config = normalizeFooterConfig((body && typeof body === "object" ? body : {}) as Parameters<typeof normalizeFooterConfig>[0]);
  try {
    const saved = await saveFooterConfig(config);
    return NextResponse.json(saved);
  } catch (e) {
    console.error("footer-config write error:", e);
    return NextResponse.json({ error: "Failed to save footer config" }, { status: 500 });
  }
}
