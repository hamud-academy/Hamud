import type { AppLocale } from "./types";

export function localeToBcp47(locale: AppLocale): string {
  if (locale === "ar") return "ar-SA";
  if (locale === "so") return "so-SO";
  return "en-US";
}

export function formatStudyDuration(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 10) return `${Math.round(hours)}h`;
  if (hours >= 1) return `${Number(hours.toFixed(1))}h`;
  return `${minutes}m`;
}

export function formatLocaleDate(locale: AppLocale, date: Date): string {
  return new Intl.DateTimeFormat(localeToBcp47(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export const WEEKDAY_KEYS = [
  "dayMon",
  "dayTue",
  "dayWed",
  "dayThu",
  "dayFri",
  "daySat",
  "daySun",
] as const;
