import { prisma } from "@/lib/prisma";
import { normalizePublicMediaUrl, resolveMediaUrl } from "@/lib/resolve-media-url";

const SETTINGS_ID = "default";

export type SiteBranding = { faviconUrl: string; tabTitle: string };

export async function getSiteBranding(): Promise<SiteBranding> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return {
      faviconUrl: resolveMediaUrl(row?.faviconUrl) ?? "",
      tabTitle: row?.tabTitle?.trim() ?? "",
    };
  } catch {
    return { faviconUrl: "", tabTitle: "" };
  }
}

export async function upsertSiteBranding(partial: { faviconUrl?: string | null; tabTitle?: string | null }) {
  const data: { faviconUrl?: string | null; tabTitle?: string | null } = {};
  if (partial.faviconUrl !== undefined) {
    const favicon = normalizePublicMediaUrl(partial.faviconUrl, "Favicon URL");
    if (!favicon.ok) throw new Error(favicon.message);
    data.faviconUrl = favicon.value;
  }
  if (partial.tabTitle !== undefined) {
    data.tabTitle = partial.tabTitle === null || partial.tabTitle === "" ? null : String(partial.tabTitle).trim();
  }
  if (Object.keys(data).length === 0) return;

  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      faviconUrl: data.faviconUrl ?? null,
      tabTitle: data.tabTitle ?? null,
    },
    update: data,
  });
}
