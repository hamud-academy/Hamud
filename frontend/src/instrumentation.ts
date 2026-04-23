/**
 * Runs once when the Node server starts (not per-request).
 * Warns if production env is misconfigured — fix in your host dashboard.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    console.warn(
      "[security] AUTH_SECRET is missing or too short. Set a strong value (e.g. openssl rand -base64 32)."
    );
  }

  const publicUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!publicUrl) {
    console.warn("[security] Set AUTH_URL (or NEXTAUTH_URL) to your public site URL in production.");
  } else if (!publicUrl.startsWith("https://")) {
    console.warn(
      "[security] AUTH_URL should use https:// in production so session cookies stay secure."
    );
  }
}
