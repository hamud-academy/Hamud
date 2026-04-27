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

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
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
