import type { AppLocale } from "./types";
import { en, type Messages } from "./messages/en";
import { so } from "./messages/so";
import { ar } from "./messages/ar";

const catalogs: Record<AppLocale, Messages> = { en, so, ar };

export type TranslationKey =
  | `nav.${keyof Messages["nav"]}`
  | `auth.${keyof Messages["auth"]}`
  | `common.${keyof Messages["common"]}`
  | `role.${keyof Messages["role"]}`
  | `admin.${keyof Messages["admin"]}`
  | `landing.${keyof Messages["landing"]}`
  | `footer.${keyof Messages["footer"]}`
  | `category.${keyof Messages["category"]}`
  | `courses.${keyof Messages["courses"]}`
  | `student.${keyof Messages["student"]}`;

/** Translate known category slugs; otherwise return the stored name. */
export function translateCategoryName(
  locale: AppLocale,
  slug: string,
  fallbackName: string
): string {
  const key = `category.${slug.toLowerCase()}` as TranslationKey;
  const translated = translate(locale, key);
  return translated === key ? fallbackName : translated;
}

function resolvePath(obj: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const template = resolvePath(catalogs[locale], key) ?? resolvePath(catalogs.en, key) ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value !== undefined ? String(value) : `{${name}}`;
  });
}

export { en, so, ar };
export type { Messages, AppLocale };
