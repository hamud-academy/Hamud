import { normalizePublicMediaUrl } from "@/lib/resolve-media-url";

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
  return normalizePublicMediaUrl(t, "Course image");
}
