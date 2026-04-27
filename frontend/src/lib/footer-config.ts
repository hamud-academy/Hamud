import { readFile } from "fs/promises";
import path from "path";
import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";

const CONFIG_PATH = path.join(process.cwd(), "data", "footer-config.json");
const CONFIG_KEY = "footer-config";

export type FooterQuickLink = { id: string; label: string; href: string };
export type FooterSocialLink = { id: string; platform: string; url: string };

export type FooterConfig = {
  description: string;
  studentCountDescription: string;
  showStudentCount: boolean;
  socialLinks: FooterSocialLink[];
  quickLinksTitle: string;
  quickLinks: FooterQuickLink[];
  copyrightText: string;
};

export const defaultFooterConfig: FooterConfig = {
  description: "Learn quality knowledge, anywhere. Join thousands of active students.",
  studentCountDescription: "Learn quality knowledge, anywhere. Join {studentCount}+ active students.",
  showStudentCount: true,
  socialLinks: [
    { id: "facebook", platform: "facebook", url: "#" },
    { id: "youtube", platform: "youtube", url: "#" },
    { id: "x", platform: "x", url: "#" },
    { id: "linkedin", platform: "linkedin", url: "#" },
  ],
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { id: "courses", label: "Courses", href: "/courses" },
    { id: "about", label: "About", href: "/about" },
    { id: "contact", label: "Contact", href: "/contact" },
    { id: "login", label: "Log in", href: "/login" },
  ],
  copyrightText: "{siteName} E-Learning. All Rights Reserved.",
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function str(value: unknown) {
  return value == null ? "" : String(value).trim();
}

function normalizeQuickLinks(value: unknown): FooterQuickLink[] {
  if (!Array.isArray(value)) return defaultFooterConfig.quickLinks;
  const links = value
    .map((item) => {
      const link = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        id: str(link.id) || genId(),
        label: str(link.label),
        href: str(link.href),
      };
    })
    .filter((link) => link.label && link.href);

  return links.length ? links : defaultFooterConfig.quickLinks;
}

function normalizeSocialLinks(value: unknown): FooterSocialLink[] {
  if (!Array.isArray(value)) return defaultFooterConfig.socialLinks;
  const links = value
    .map((item) => {
      const link = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        id: str(link.id) || genId(),
        platform: str(link.platform) || "facebook",
        url: str(link.url),
      };
    })
    .filter((link) => link.platform);

  return links.length ? links : defaultFooterConfig.socialLinks;
}

export function normalizeFooterConfig(data: Partial<FooterConfig>): FooterConfig {
  return {
    description: str(data.description) || defaultFooterConfig.description,
    studentCountDescription: str(data.studentCountDescription) || defaultFooterConfig.studentCountDescription,
    showStudentCount: typeof data.showStudentCount === "boolean" ? data.showStudentCount : defaultFooterConfig.showStudentCount,
    socialLinks: normalizeSocialLinks(data.socialLinks),
    quickLinksTitle: str(data.quickLinksTitle) || defaultFooterConfig.quickLinksTitle,
    quickLinks: normalizeQuickLinks(data.quickLinks),
    copyrightText: str(data.copyrightText) || defaultFooterConfig.copyrightText,
  };
}

export async function getFooterConfig(): Promise<FooterConfig> {
  const dbConfig = await getAppConfig<Partial<FooterConfig>>(CONFIG_KEY);
  if (dbConfig) return normalizeFooterConfig(dbConfig);

  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw) as Partial<FooterConfig>;
    return normalizeFooterConfig(data);
  } catch {
    return defaultFooterConfig;
  }
}

export async function saveFooterConfig(config: FooterConfig): Promise<FooterConfig> {
  const normalized = normalizeFooterConfig(config);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}
