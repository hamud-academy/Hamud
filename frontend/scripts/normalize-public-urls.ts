import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";
import { saveUploadedFile } from "@/lib/upload-storage";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".ogg") return "video/ogg";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".xls") return "application/vnd.ms-excel";
  if (ext === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "application/octet-stream";
}

function relativeUploadPath(value: string): string | null {
  const trimmed = value.trim();
  if (/^uploads\//i.test(trimmed)) return trimmed.replace(/^\/+/, "");
  if (trimmed.startsWith("/uploads/")) return trimmed.slice(1);

  try {
    const url = new URL(trimmed);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
    if (isLocal && url.pathname.startsWith("/uploads/")) return url.pathname.slice(1);
  } catch {
    return null;
  }

  return null;
}

async function uploadLocalPublicFile(relativePath: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", relativePath);
    const data = await readFile(filePath);
    const { url } = await saveUploadedFile(relativePath, data, contentTypeFor(filePath), {
      requirePublicUrl: true,
    });
    return url;
  } catch {
    return null;
  }
}

async function normalizeUrl(value: string): Promise<string> {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const uploadPath = relativeUploadPath(trimmed);
  if (uploadPath) {
    const uploaded = await uploadLocalPublicFile(uploadPath);
    if (uploaded) return uploaded;

    const origin = getPublicAppOrigin();
    return origin ? `${origin}/${uploadPath}` : trimmed;
  }

  try {
    const url = new URL(trimmed);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
    if (isLocal) {
      const origin = getPublicAppOrigin();
      return origin ? `${origin}${url.pathname}${url.search}${url.hash}` : trimmed;
    }
  } catch {
    return value;
  }

  return value;
}

async function normalizeJson(value: JsonValue): Promise<JsonValue> {
  if (typeof value === "string") return normalizeUrl(value);
  if (Array.isArray(value)) return Promise.all(value.map((item) => normalizeJson(item)));
  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await normalizeJson(item)] as const)
    );
    return Object.fromEntries(entries);
  }
  return value;
}

async function updateStringField(
  label: string,
  records: Array<{ id: string; value: string | null }>,
  update: (id: string, value: string) => Promise<unknown>
) {
  let changed = 0;
  for (const record of records) {
    if (!record.value) continue;
    const next = await normalizeUrl(record.value);
    if (next !== record.value) {
      await update(record.id, next);
      changed += 1;
    }
  }
  console.log(`${label}: ${changed} updated`);
}

async function main() {
  if (!getPublicAppOrigin() && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Set NEXT_PUBLIC_APP_URL or BLOB_READ_WRITE_TOKEN before normalizing URLs.");
  }

  await updateStringField(
    "Course thumbnails",
    (await prisma.course.findMany({ select: { id: true, thumbnail: true } })).map((row) => ({
      id: row.id,
      value: row.thumbnail,
    })),
    (id, value) => prisma.course.update({ where: { id }, data: { thumbnail: value } })
  );

  await updateStringField(
    "Lesson videos",
    (await prisma.lesson.findMany({ select: { id: true, videoUrl: true } })).map((row) => ({
      id: row.id,
      value: row.videoUrl,
    })),
    (id, value) => prisma.lesson.update({ where: { id }, data: { videoUrl: value } })
  );

  await updateStringField(
    "Lesson documents",
    (await prisma.lesson.findMany({ select: { id: true, documentUrl: true } })).map((row) => ({
      id: row.id,
      value: row.documentUrl,
    })),
    (id, value) => prisma.lesson.update({ where: { id }, data: { documentUrl: value } })
  );

  await updateStringField(
    "User images",
    (await prisma.user.findMany({ select: { id: true, image: true } })).map((row) => ({
      id: row.id,
      value: row.image,
    })),
    (id, value) => prisma.user.update({ where: { id }, data: { image: value } })
  );

  await updateStringField(
    "Site favicon",
    (await prisma.siteSettings.findMany({ select: { id: true, faviconUrl: true } })).map((row) => ({
      id: row.id,
      value: row.faviconUrl,
    })),
    (id, value) => prisma.siteSettings.update({ where: { id }, data: { faviconUrl: value } })
  );

  const appConfigs = await prisma.$queryRaw<Array<{ key: string; value: JsonValue }>>`
    SELECT key, value
    FROM app_configs
  `;
  let appConfigChanges = 0;
  for (const config of appConfigs) {
    const next = await normalizeJson(config.value);
    if (JSON.stringify(next) !== JSON.stringify(config.value)) {
      await prisma.$executeRaw`
        UPDATE app_configs
        SET value = ${JSON.stringify(next)}::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE key = ${config.key}
      `;
      appConfigChanges += 1;
    }
  }
  console.log(`App configs: ${appConfigChanges} updated`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
