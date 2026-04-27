/**
 * Rewrites local dev image URLs (localhost / 127.0.0.1) to the public site origin
 * from env (NEXT_PUBLIC_APP_URL, VERCEL_URL, or NEXTAUTH_URL) so the same DB/config
 * works on Vercel. Paths like "/uploads/..." are returned unchanged.
 */
function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function publicOriginFrom(raw: string | undefined): string | null {
  const trimmed = raw?.trim().replace(/\/$/, "");
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return isLocalHostname(url.hostname) ? null : url.origin;
  } catch {
    return null;
  }
}

export function getPublicAppOrigin(): string | null {
  return (
    publicOriginFrom(process.env.NEXT_PUBLIC_APP_URL) ??
    publicOriginFrom(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    publicOriginFrom(process.env.NEXTAUTH_URL)
  );
}

function getAppOrigin(): string {
  return getPublicAppOrigin() ?? "http://localhost:3000";
}

export function isLocalUrl(url: URL): boolean {
  return isLocalHostname(url.hostname);
}

export function normalizePublicMediaUrl(
  raw: string | null | undefined,
  fieldName = "Media URL"
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (raw == null || String(raw).trim() === "") return { ok: true, value: null };
  const trimmed = String(raw).trim();
  const publicOrigin = getPublicAppOrigin();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (!publicOrigin) {
      return { ok: false, message: `${fieldName} must be a public URL. Set NEXT_PUBLIC_APP_URL or upload to Vercel Blob.` };
    }
    return { ok: true, value: `${publicOrigin}${trimmed}` };
  }

  if (/^uploads\//i.test(trimmed)) {
    if (!publicOrigin) {
      return { ok: false, message: `${fieldName} must be a public URL. Set NEXT_PUBLIC_APP_URL or upload to Vercel Blob.` };
    }
    return { ok: true, value: `${publicOrigin}/${trimmed}` };
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, message: `${fieldName} must be a valid public http(s) URL.` };
    }
    if (isLocalHostname(url.hostname)) {
      if (!publicOrigin) {
        return { ok: false, message: `${fieldName} cannot use localhost. Set NEXT_PUBLIC_APP_URL or upload to Vercel Blob.` };
      }
      return { ok: true, value: `${publicOrigin}${url.pathname}${url.search}${url.hash}` };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, message: `${fieldName} must be a valid public http(s) URL.` };
  }
}

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    const origin = getPublicAppOrigin();
    return origin ? `${origin}${trimmed}` : trimmed;
  }

  if (/^uploads\//i.test(trimmed)) {
    const origin = getPublicAppOrigin();
    return origin ? `${origin}/${trimmed}` : `/${trimmed}`;
  }

  const origin = getAppOrigin();
  try {
    const u = new URL(trimmed);
    if (isLocalHostname(u.hostname)) {
      return `${origin}${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}
