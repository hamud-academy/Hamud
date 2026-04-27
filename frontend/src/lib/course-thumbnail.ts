import { getPublicAppOrigin } from "@/lib/resolve-media-url";

/** Accepts public http(s) URLs for course thumbnail images. */
export function normalizeCourseThumbnail(
  raw: string | undefined | null
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (raw == null || String(raw).trim() === "") {
    return { ok: true, value: null };
  }
  const t = String(raw).trim();
  if (t.length > 4000) {
    return { ok: false, message: "Image URL too long" };
  }
  try {
    const u = new URL(t);
    const isLocal =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "::1";
    if (u.protocol === "http:" || u.protocol === "https:") {
      if (isLocal) {
        const origin = getPublicAppOrigin();
        if (origin) {
          return { ok: true, value: `${origin}${u.pathname}${u.search}${u.hash}` };
        }
        return { ok: false, message: "Course image must be a public URL, not localhost" };
      }
      return { ok: true, value: u.toString() };
    }
  } catch {
    /* relative path */
  }
  if (t.startsWith("/")) {
    const origin = getPublicAppOrigin();
    if (origin) {
      return { ok: true, value: `${origin}${t}` };
    }
    return { ok: false, message: "Course image must be a public URL, not a local path" };
  }
  return {
    ok: false,
    message: "Course image must be a valid public http(s) URL",
  };
}
