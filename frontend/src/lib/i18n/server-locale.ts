import { cookies } from "next/headers";
import { translate, type TranslationKey } from "@/lib/i18n";
import { type AppLocale, LOCALE_COOKIE, isAppLocale } from "@/lib/i18n/types";

export async function getServerLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isAppLocale(value)) return value;
  return "en";
}

export async function getServerTranslator() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
  };
}
