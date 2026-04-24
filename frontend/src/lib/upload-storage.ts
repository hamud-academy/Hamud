import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";

/** Path under `public/`, no leading slash (e.g. uploads/images/x.jpg). */
export type PublicUploadPath = string;

/**
 * Saves bytes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (production),
 * otherwise to `public/<path>` for local development.
 *
 * Requires a **public** Vercel Blob store (`put` uses `access: "public"`). Private
 * stores cannot be toggled to public after creation — create a new public store if needed.
 */
export async function saveUploadedFile(
  relativePath: PublicUploadPath,
  data: Buffer,
  contentType: string
): Promise<{ url: string }> {
  const normalized = relativePath.replace(/^\/+/, "");
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const useVercelBlob =
    Boolean(token) &&
    token !== "vercel_blob_rw_..." &&
    token.length >= 40;

  if (useVercelBlob) {
    const blob = await put(normalized, data, {
      access: "public",
      token: token!,
      contentType: contentType || "application/octet-stream",
    });
    return { url: blob.url };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN ma aha mid sax (ama ma jiro). Vercel → firtech-elearning → Settings → Environment Variables: ku dar token-ka Blob (Production), ka dib Redeploy."
    );
  }

  const fullPath = path.join(process.cwd(), "public", normalized);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, data);
  return { url: `/${normalized}` };
}

/** Surfaces Blob setup hints from saveUploadedFile in API JSON responses. */
export function uploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")) {
    return error.message;
  }
  return "Failed to save file";
}
