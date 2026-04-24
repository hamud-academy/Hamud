import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";

/** Path under `public/`, no leading slash (e.g. uploads/images/x.jpg). */
export type PublicUploadPath = string;

/**
 * Saves bytes to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (production),
 * otherwise to `public/<path>` for local development.
 */
export async function saveUploadedFile(
  relativePath: PublicUploadPath,
  data: Buffer,
  contentType: string
): Promise<{ url: string }> {
  const normalized = relativePath.replace(/^\/+/, "");
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const blob = await put(normalized, data, {
      access: "public",
      token,
      contentType: contentType || "application/octet-stream",
    });
    return { url: blob.url };
  }

  const fullPath = path.join(process.cwd(), "public", normalized);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, data);
  return { url: `/${normalized}` };
}
