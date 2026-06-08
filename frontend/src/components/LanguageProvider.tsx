"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { translate, type TranslationKey } from "@/lib/i18n";
import {
  type AppLocale,
  LOCALE_COOKIE,
  isAppLocale,
  isRtlLocale,
} from "@/lib/i18n/types";

const STORAGE_KEY = "hamud_locale";

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && isAppLocale(fromStorage)) return fromStorage;
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
    const fromCookie = match?.[1] ? decodeURIComponent(match[1]) : "";
    if (fromCookie && isAppLocale(fromCookie)) return fromCookie;
  } catch {
    /* ignore */
  }
  return "en";
}

function persistLocale(locale: AppLocale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function applyDocumentLocale(locale: AppLocale) {
  const html = document.documentElement;
  html.lang = locale === "so" ? "so" : locale;
  html.dir = isRtlLocale(locale) ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AppLocale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    persistLocale(stored);
    applyDocumentLocale(stored);
    setReady(true);
  }, []);

  const setLocale = useCallback(
    (next: AppLocale) => {
      setLocaleState(next);
      persistLocale(next);
      applyDocumentLocale(next);
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dir: isRtlLocale(locale) ? "rtl" : "ltr",
    }),
    [locale, setLocale, t]
  ) as LanguageContextValue;

  if (!ready) {
    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { t, locale, dir, setLocale } = useLanguage();
  return { t, locale, dir, setLocale };
}
