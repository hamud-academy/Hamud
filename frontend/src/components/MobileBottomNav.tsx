"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/components/LanguageProvider";
import {
  type MobileNavAccentLink,
  type MobileNavLink,
  isMobileNavItemActive,
  isMoreMenuActive,
  isHomeNavActive,
} from "@/lib/mobile-nav-config";
import type { TranslationKey } from "@/lib/i18n";

const ICON_PATHS: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  grid: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  diploma: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  trophy: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  quote: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20v-4a7 7 0 017-7h4c2.21 0 4 1.79 4 4z",
  requests: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  plus: "M12 4v16m8-8H4",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  courses: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  about: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  contact: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  login: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

function NavIcon({ icon, className = "w-5 h-5" }: { icon: string; className?: string }) {
  const path = ICON_PATHS[icon] ?? ICON_PATHS.grid;
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

function tabShortLabel(label: string, labelKey: TranslationKey) {
  if (labelKey === "nav.myCourses") return label.slice(0, 7);
  if (label.length <= 8) return label;
  return label.slice(0, 7);
}

function renderTabLink(
  item: MobileNavLink,
  pathname: string,
  showLabels: boolean,
  label: string,
  variant: "primary" | "accent" = "primary"
) {
  const active = isMobileNavItemActive(pathname, item);
  const baseClass =
    variant === "accent"
      ? `flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 ${
          active ? "ring-2 ring-blue-300/60 dark:ring-blue-500/50" : ""
        }`
      : `flex min-w-[3rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 transition ${
          active
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
        }`;

  return (
    <Link
      key={item.href}
      href={item.href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      className={baseClass}
    >
      <NavIcon icon={item.icon} className={variant === "accent" ? "w-5 h-5" : "h-5 w-5"} />
      {showLabels && variant === "primary" ? (
        <span className="max-w-[4.25rem] truncate text-[10px] font-semibold leading-none">{tabShortLabel(label, item.labelKey)}</span>
      ) : null}
    </Link>
  );
}

type Props = {
  homeHref: string;
  primary: MobileNavLink[];
  trailing?: MobileNavLink[];
  accent?: MobileNavAccentLink[];
  more?: MobileNavLink[];
  /** Full sidebar-style panel (e.g. AdminNav) instead of flat link list */
  moreContent?: (close: () => void) => ReactNode;
  /** Override active state for the more button */
  moreActive?: boolean;
  /** Panel background: admin sidebar grey vs app white sidebar */
  morePanelTheme?: "admin" | "app";
  /** Top offset class for sidebar panel (admin/teacher mobile header) */
  morePanelTopClass?: string;
  showTabLabels?: boolean;
  showThemeToggle?: boolean;
  signOutHref?: string;
  onSignOut?: () => void;
  /** Adds body padding for public pages that use Header */
  padMainContent?: boolean;
};

export default function MobileBottomNav({
  homeHref,
  primary,
  trailing = [],
  accent = [],
  more = [],
  moreContent,
  moreActive: moreActiveProp,
  morePanelTheme = "admin",
  morePanelTopClass = "top-14",
  showTabLabels = false,
  showThemeToggle = true,
  signOutHref,
  onSignOut,
  padMainContent = false,
}: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreActiveProp ?? isMoreMenuActive(pathname, more);
  const homeActive = isHomeNavActive(pathname, homeHref);
  const showMore = more.length > 0 || !!moreContent;
  const sidebarMorePanel = !!moreContent;
  const panelSurface =
    morePanelTheme === "admin"
      ? "border-slate-200/80 bg-[#F8F8F8] dark:border-slate-800 dark:bg-slate-900"
      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
  const panelFooterSurface =
    morePanelTheme === "admin"
      ? "border-slate-200/80 bg-[#F8F8F8] dark:border-slate-800 dark:bg-slate-900"
      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
  const panelInsetSurface =
    morePanelTheme === "admin" ? "bg-white/80 dark:bg-slate-800/60" : "bg-slate-50 dark:bg-slate-800/60";

  useEffect(() => {
    if (padMainContent) {
      document.documentElement.setAttribute("data-mobile-bottom-nav", "true");
      return () => document.documentElement.removeAttribute("data-mobile-bottom-nav");
    }
  }, [padMainContent]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const closeMore = () => setMoreOpen(false);

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
          aria-label="Close menu"
          onClick={closeMore}
        />
      )}

      {moreOpen && showMore && sidebarMorePanel && (
        <div
          className={`lg:hidden fixed inset-x-0 ${morePanelTopClass} bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-[56] flex flex-col overflow-hidden border-t shadow-2xl ${panelSurface}`}
          role="dialog"
          aria-label={t("nav.more")}
        >
          <div className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${panelSurface}`}>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("nav.more")}</p>
            <button
              type="button"
              onClick={closeMore}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label={t("common.closeMenu")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {moreContent?.(closeMore)}
          </div>
          <div className={`shrink-0 border-t p-3 ${panelFooterSurface}`}>
            <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2.5 ${panelInsetSurface}`}>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.language")}</span>
              <LanguageSelector compact />
            </div>
            {showThemeToggle && (
              <div className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2.5 ${panelInsetSurface}`}>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.theme")}</span>
                <ThemeToggle className="!h-9 !w-9" />
              </div>
            )}
            {signOutHref && (
              <Link
                href={signOutHref}
                onClick={closeMore}
                className="flex w-full items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {t("auth.logout")}
              </Link>
            )}
          </div>
        </div>
      )}

      {moreOpen && showMore && !sidebarMorePanel && (
        <div
          className="lg:hidden fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-[56] max-h-[min(70vh,28rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
          role="dialog"
          aria-label={t("nav.more")}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("nav.more")}</p>
            <button
              type="button"
              onClick={closeMore}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label={t("common.closeMenu")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-[min(60vh,24rem)] overflow-y-auto overscroll-contain p-2">
            {more.map((item) => {
              const active = isMobileNavItemActive(pathname, item);
              const label = t(item.labelKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMore}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <NavIcon icon={item.icon} />
                  {label}
                </Link>
              );
            })}
          </div>
          {(showThemeToggle || signOutHref || onSignOut || more.length > 0) && (
            <div className="border-t border-slate-100 p-3 dark:border-slate-800">
              <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.language")}</span>
                <LanguageSelector compact />
              </div>
              {showThemeToggle && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.theme")}</span>
                  <ThemeToggle className="!h-9 !w-9" />
                </div>
              )}
              {(signOutHref || onSignOut) && (
                signOutHref ? (
                  <Link
                    href={signOutHref}
                    onClick={closeMore}
                    className="flex w-full items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {t("auth.logout")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMore();
                      onSignOut?.();
                    }}
                    className="flex w-full items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {t("auth.logout")}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}

      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-[57] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
        aria-label="Mobile bottom navigation"
      >
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-around gap-0.5 rounded-[1.75rem] border border-slate-200/80 bg-white/95 px-1.5 py-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/40">
          {primary.map((item) => renderTabLink(item, pathname, showTabLabels, t(item.labelKey)))}

          <Link
            href={homeHref}
            aria-label={t("common.home")}
            aria-current={homeActive ? "page" : undefined}
            title={t("nav.dashboard")}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 ${
              homeActive ? "ring-2 ring-blue-300/60 dark:ring-blue-500/50" : ""
            }`}
          >
            <NavIcon icon="home" className="w-5 h-5" />
          </Link>

          {trailing.map((item) => renderTabLink(item, pathname, showTabLabels, t(item.labelKey)))}

          {accent.map((item) => renderTabLink(item, pathname, showTabLabels, t(item.labelKey), "accent"))}

          {showMore && (
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-label={t("nav.more")}
              aria-expanded={moreOpen}
              className={`flex min-w-[3rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 transition ${
                moreOpen || moreActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="5" cy="12" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="19" cy="12" r="1.75" />
              </svg>
              {showTabLabels ? (
                <span className="text-[10px] font-semibold leading-none">{t("nav.more")}</span>
              ) : null}
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
