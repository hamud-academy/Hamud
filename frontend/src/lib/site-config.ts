import { readFile } from "fs/promises";
import path from "path";
import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");
const CONFIG_KEY = "site-config";
const defaultConfig = { siteName: "BaroSmart", logoUrl: "", accentSuffix: "" };

export type SiteConfig = { siteName: string; logoUrl: string; accentSuffix: string };

function normalizeSiteConfig(data: Partial<SiteConfig>): SiteConfig {
  return {
    siteName: data.siteName?.trim() || defaultConfig.siteName,
    logoUrl:
      resolveMediaUrl(data.logoUrl ?? defaultConfig.logoUrl) ??
      defaultConfig.logoUrl,
    accentSuffix: data.accentSuffix?.trim() ?? defaultConfig.accentSuffix,
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const dbConfig = await getAppConfig<Partial<SiteConfig>>(CONFIG_KEY);
  if (dbConfig) return normalizeSiteConfig(dbConfig);

  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw) as { siteName?: string; logoUrl?: string; accentSuffix?: string };
    return normalizeSiteConfig(data);
  } catch {
    return defaultConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  const normalized = normalizeSiteConfig(config);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}
