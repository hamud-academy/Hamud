import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import {
  assertPersistentUploadStorage,
  hasValidBlobToken,
  allowsLocalUploadFallback,
} from "@/lib/persistent-storage";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";

/** Path under `public/`, no leading slash (e.g. uploads/images/x.jpg). */
export type PublicUploadPath = string;
type UploadOptions = { requirePublicUrl?: boolean };

/**
 * Saves uploads to Vercel Blob (persistent cloud storage).
 * File URLs are stored in PostgreSQL; bytes live in Blob — not on ephemeral local disk.
 *
 * Local `public/uploads` is only used when ALLOW_LOCAL_UPLOADS=true and no cloud DB/Blob (offline dev).
 */
export async function saveUploadedFile(
  relativePath: PublicUploadPath,
  data: Buffer,
  contentType: string,
  options: UploadOptions = {}
): Promise<{ url: string }> {
  const normalized = relativePath.replace(/^\/+/, "");

  if (hasValidBlobToken()) {
    const blob = await put(normalized, data, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN!.trim(),
      contentType: contentType || "application/octet-stream",
    });
    return { url: blob.url };
  }

  assertPersistentUploadStorage();

  if (!allowsLocalUploadFallback()) {
    throw new Error("Persistent upload storage is not configured.");
  }

  const publicOrigin = getPublicAppOrigin();
  if (options.requirePublicUrl && !publicOrigin) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be set for public upload URLs, or configure BLOB_READ_WRITE_TOKEN."
    );
  }

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
  if (error instanceof Error) {
    if (
      error.message.includes("BLOB_READ_WRITE_TOKEN") ||
      error.message.includes("persistent") ||
      error.message.includes("public URL")
    ) {
      return error.message;
    }
  }
  return "Failed to save file";
}
