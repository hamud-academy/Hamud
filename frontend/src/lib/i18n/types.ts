export type AppLocale = "so" | "ar" | "en";

export const LOCALES: AppLocale[] = ["so", "ar", "en"];

export const LOCALE_COOKIE = "hamud_locale";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  so: "Af-Somali",
  ar: "العربية",
  en: "English",
};

export const LOCALE_SHORT: Record<AppLocale, string> = {
  so: "SO",
  ar: "AR",
  en: "EN",
};

export function isRtlLocale(locale: AppLocale): boolean {
  return locale === "ar";
}

export function isAppLocale(value: string): value is AppLocale {
  return value === "so" || value === "ar" || value === "en";
}
