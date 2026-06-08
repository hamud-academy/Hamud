import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const CONFIG_KEY = "site-config";
const defaultConfig = { siteName: DEFAULT_SITE_NAME, logoUrl: "", accentSuffix: "" };

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
  return defaultConfig;
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  const normalized = normalizeSiteConfig(config);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}
