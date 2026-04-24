/**
 * Rewrites local dev image URLs (localhost / 127.0.0.1) to the public site origin
 * from env (NEXTAUTH_URL, VERCEL_URL, or NEXT_PUBLIC_APP_URL) so the same DB/config
 * works on Vercel. Paths like "/uploads/..." are returned unchanged.
 */
function getAppOrigin(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
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
    const isLocal =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "::1";
    if (isLocal) {
      return `${origin}${u.pathname}${u.search}${u.hash}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}
