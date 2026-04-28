import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSiteBranding } from "@/lib/site-branding";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function GET() {
  const { faviconUrl } = await getSiteBranding();
  if (!faviconUrl) {
    return new NextResponse(null, { status: 404 });
  }

  let pathname: string;
  try {
    const url = new URL(faviconUrl);
    const appOrigin = getPublicAppOrigin();

    if (!appOrigin || url.origin !== appOrigin) {
      return NextResponse.redirect(url, {
        status: 307,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    pathname = url.pathname;
  } catch {
    if (!faviconUrl.startsWith("/")) {
      return new NextResponse(null, { status: 404 });
    }
    pathname = faviconUrl;
  }

  const relative = pathname.replace(/^\/+/, "");
  const publicRoot = path.resolve(process.cwd(), "public");
  const absolute = path.resolve(publicRoot, relative);
  const underPublic = path.relative(publicRoot, absolute);
  if (underPublic.startsWith("..") || path.isAbsolute(underPublic)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const buf = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
