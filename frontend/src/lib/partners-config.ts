import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import {
  defaultPartnersConfig,
  type PartnerLogoConfig,
  type PartnersConfig,
} from "@/lib/partners-config-defaults";

const CONFIG_KEY = "partners-config";

function normalizePartner(partner: Partial<PartnerLogoConfig>, index: number): PartnerLogoConfig {
  const name = partner.name?.trim() || `Partner ${index + 1}`;
  return {
    id: partner.id?.trim() || `partner-${index + 1}`,
    name,
    logoUrl: resolveMediaUrl(partner.logoUrl) ?? "",
  };
}

export function normalizePartnersConfig(data: Partial<PartnersConfig> | null | undefined): PartnersConfig {
  const partners = Array.isArray(data?.partners)
    ? data.partners.map((partner, index) => normalizePartner(partner, index))
    : defaultPartnersConfig.partners;

  return {
    eyebrow: data?.eyebrow?.trim() || defaultPartnersConfig.eyebrow,
    title: data?.title?.trim() || defaultPartnersConfig.title,
    partners: partners.length > 0 ? partners : defaultPartnersConfig.partners,
  };
}

export async function getPartnersConfig(): Promise<PartnersConfig> {
  const config = await getAppConfig<Partial<PartnersConfig>>(CONFIG_KEY);
  return normalizePartnersConfig(config);
}

export async function savePartnersConfig(config: PartnersConfig): Promise<PartnersConfig> {
  const normalized = normalizePartnersConfig(config);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}
