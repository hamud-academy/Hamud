/** Accepts http(s) URLs or same-site paths (e.g. /uploads/images/...). */
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
    if (u.protocol === "http:" || u.protocol === "https:") {
      return { ok: true, value: t };
    }
  } catch {
    /* relative path */
  }
  if (t.startsWith("/")) {
    return { ok: true, value: t };
  }
  return {
    ok: false,
    message: "Course image must be a valid http(s) URL or a path starting with /",
  };
}
