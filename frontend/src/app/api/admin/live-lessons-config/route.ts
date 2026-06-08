import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getLiveLessonsConfig,
  saveLiveLessonsConfig,
} from "@/lib/live-lessons-config";
import type { LiveLessonsConfig } from "@/lib/live-lessons-config-defaults";
import { normalizePublicMediaUrl } from "@/lib/resolve-media-url";

export const dynamic = "force-dynamic";

function normalizeUploadedImageUrl(raw: string | null | undefined, fieldName: string) {
  const value = raw == null ? "" : String(raw).trim();
  if (!value) return { ok: true as const, value: "" };

  // Local uploads are served from Next public/ as same-origin paths.
  if (value.startsWith("/uploads/") || /^uploads\//i.test(value)) {
    return { ok: true as const, value: value.startsWith("/") ? value : `/${value}` };
  }

  return normalizePublicMediaUrl(value, fieldName);
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(await getLiveLessonsConfig());
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: Partial<LiveLessonsConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await getLiveLessonsConfig();
  if (body.heroImageUrl !== undefined) {
    const image = normalizeUploadedImageUrl(body.heroImageUrl, "Live lessons image URL");
    if (!image.ok) {
      return NextResponse.json({ error: image.message }, { status: 400 });
    }
    current.heroImageUrl = image.value ?? "";
  }

  if (body.classes) {
    body.classes = body.classes.map((item) => {
      const image = normalizeUploadedImageUrl(item.imageUrl, "Live class image URL");
      return {
        ...item,
        imageUrl: image.ok ? image.value ?? "" : item.imageUrl,
      };
    });
  }

  const nextConfig: LiveLessonsConfig = {
    ...current,
    ...body,
    heroImageUrl: current.heroImageUrl,
  };

  try {
    const saved = await saveLiveLessonsConfig(nextConfig);
    return NextResponse.json(saved);
  } catch (e) {
    console.error("live-lessons-config save error:", e);
    return NextResponse.json({ error: "Failed to save live lessons config" }, { status: 500 });
  }
}
