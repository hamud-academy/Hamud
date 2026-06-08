/** True when DATABASE_URL points at Neon (or other hosted Postgres). */
export function usesCloudDatabase(): boolean {
  const url = process.env.DATABASE_URL?.trim().toLowerCase() ?? "";
  return url.includes("neon.tech") || url.includes("supabase.co") || url.includes("render.com");
}

export function hasValidBlobToken(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return !!(token && token !== "vercel_blob_rw_..." && token.length >= 40);
}

/** Local `public/uploads` only when explicitly allowed (offline dev without Blob). */
export function allowsLocalUploadFallback(): boolean {
  return process.env.ALLOW_LOCAL_UPLOADS?.trim().toLowerCase() === "true";
}

export function getUploadStorageMode(): "vercel-blob" | "local-public" | "misconfigured" {
  if (hasValidBlobToken()) return "vercel-blob";
  if (process.env.VERCEL || usesCloudDatabase()) return "misconfigured";
  if (allowsLocalUploadFallback()) return "local-public";
  return "misconfigured";
}

export function assertPersistentUploadStorage() {
  const mode = getUploadStorageMode();
  if (mode !== "misconfigured") return;

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required on Vercel. Project → Storage → Blob → Connect, then redeploy."
    );
  }

  if (usesCloudDatabase()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required when DATABASE_URL uses Neon/cloud Postgres. Uploads must not use temporary local disk."
    );
  }

  throw new Error(
    "Set BLOB_READ_WRITE_TOKEN for persistent uploads, or ALLOW_LOCAL_UPLOADS=true for offline local dev only."
  );
}

export function logPersistentStorageStatus() {
  const db = usesCloudDatabase() ? "cloud-postgresql (Neon)" : "local/other";
  const uploads = getUploadStorageMode();
  console.log(`[Storage] Database: ${db} | Uploads: ${uploads}`);
  if (uploads === "misconfigured") {
    console.warn("[Storage] Uploads are not configured for persistent cloud storage.");
  }
}
