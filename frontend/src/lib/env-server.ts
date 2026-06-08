import "server-only";

const REQUIRED_IN_PRODUCTION = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
] as const;

let validated = false;

function getPublicAppUrl(): string {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    ""
  );
}

/** Fail fast in production when secrets are missing (avoids broken deploys). */
export function assertProductionEnv() {
  if (validated || process.env.NODE_ENV !== "production") return;
  validated = true;

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]?.trim());
  if (!getPublicAppUrl()) {
    missing.push("AUTH_URL" as (typeof REQUIRED_IN_PRODUCTION)[number]);
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. See .env.example and set them in Vercel.`
    );
  }

  const authSecret = process.env.AUTH_SECRET!.trim();
  if (authSecret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters in production.");
  }

  const appUrl = getPublicAppUrl();
  if (appUrl.includes("localhost")) {
    throw new Error("AUTH_URL / NEXTAUTH_URL must not use localhost in production.");
  }

  if (!appUrl.startsWith("https://")) {
    throw new Error("Public app URL must use https:// in production.");
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN!.trim();
  if (blobToken.length < 40 || blobToken === "vercel_blob_rw_...") {
    throw new Error("BLOB_READ_WRITE_TOKEN must be a valid Vercel Blob token in production.");
  }
}
