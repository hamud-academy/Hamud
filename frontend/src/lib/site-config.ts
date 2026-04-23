import { readFile } from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");
const defaultConfig = { siteName: "BaroSmart", logoUrl: "", accentSuffix: "" };

export type SiteConfig = { siteName: string; logoUrl: string; accentSuffix: string };

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw) as { siteName?: string; logoUrl?: string; accentSuffix?: string };
    return {
      siteName: data.siteName ?? defaultConfig.siteName,
      logoUrl: data.logoUrl ?? defaultConfig.logoUrl,
      accentSuffix: data.accentSuffix ?? defaultConfig.accentSuffix,
    };
  } catch {
    return defaultConfig;
  }
}
