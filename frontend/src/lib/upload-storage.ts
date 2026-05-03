import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";

/** Path under `public/`, no leading slash (e.g. uploads/images/x.jpg). */
export type PublicUploadPath = string;
type UploadOptions = { requirePublicUrl?: boolean };

/**
 * Saves bytes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (production),
 * otherwise to `public/<path>` for local development.
 *
 * Local disk returns `https?://…/path` when `getPublicAppOrigin()` is set, else a
 * root-relative `/uploads/...` URL (same-origin in the browser).
 *
 * Requires a **public** Vercel Blob store (`put` uses `access: "public"`). Private
 * stores cannot be toggled to public after creation — create a new public store if needed.
 */
export async function saveUploadedFile(
  relativePath: PublicUploadPath,
  data: Buffer,
  contentType: string,
  _options: UploadOptions = {}
): Promise<{ url: string }> {
  const normalized = relativePath.replace(/^\/+/, "");
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token && token !== "vercel_blob_rw_..." && token.length >= 40) {
    const blob = await put(normalized, data, {
      access: "public",
      token,
      contentType: contentType || "application/octet-stream",
    });
    return { url: blob.url };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is invalid or missing. In Vercel, go to firtech-elearning > Settings > Environment Variables, add the Blob token for Production, then redeploy."
    );
  }

  // Local / self-hosted: write under `public/` and serve via Next static files.
  // Root-relative URLs work on the same origin without NEXT_PUBLIC_APP_URL (localhost dev).
  const publicOrigin = getPublicAppOrigin();
  const fullPath = path.join(process.cwd(), "public", normalized);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, data);

  if (publicOrigin) {
    return { url: `${publicOrigin}/${normalized}` };
  }

  return { url: `/${normalized}` };
}

/** Surfaces Blob setup hints from saveUploadedFile in API JSON responses. */
export function uploadErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    (error.message.includes("BLOB_READ_WRITE_TOKEN") ||
      error.message.includes("public URL"))
  ) {
    return error.message;
  }
  return "Failed to save file";
}
