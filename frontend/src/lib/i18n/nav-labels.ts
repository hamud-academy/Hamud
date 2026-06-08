import type { TranslationKey } from "@/lib/i18n";
import type { MobileNavAccentLink, MobileNavLink } from "@/lib/mobile-nav-config";

export type NavItemWithKey = Omit<MobileNavLink, "label"> & { labelKey: TranslationKey };
export type NavAccentWithKey = Omit<MobileNavAccentLink, "label"> & { labelKey: TranslationKey };

export function withNavLabels<T extends { labelKey: TranslationKey }>(
  items: T[],
  t: (key: TranslationKey) => string
): (T & { label: string })[] {
  return items.map((item) => ({ ...item, label: t(item.labelKey) }));
}
