"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/components/LanguageProvider";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";
import type { TranslationKey } from "@/lib/i18n";

const navLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/courses", labelKey: "nav.courses" },
  { href: "/diploma", labelKey: "nav.diploma" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contact", labelKey: "nav.contact" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandName({
  siteName,
  accentSuffix,
  dark = false,
  size = "base",
}: {
  siteName: string;
  accentSuffix: string;
  dark?: boolean;
  size?: "base" | "lg";
}) {
  const baseClass =
    size === "lg"
      ? "text-xl font-bold tracking-tight"
      : "text-sm font-semibold tracking-tight sm:text-[1.05rem] sm:font-semibold lg:text-lg";
  const mainColor = dark ? "text-white" : "text-slate-900 dark:text-slate-50";
  const accentColor = dark ? "text-emerald-400" : "text-blue-600 dark:text-blue-400";

  if (accentSuffix && siteName.endsWith(accentSuffix)) {
    const main = siteName.slice(0, -accentSuffix.length);
    return (
      <span className={`${baseClass} ${mainColor}`}>
        {main}
        <span className={accentColor}>{accentSuffix}</span>
      </span>
    );
  }
  return (
    <span className={`${baseClass} ${dark ? "text-white" : "text-slate-900 dark:text-slate-50"}`}>
      {siteName}
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState(DEFAULT_SITE_NAME);
  const [logoUrl, setLogoUrl] = useState("");
  const [accentSuffix, setAccentSuffix] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.siteName) setSiteName(data.siteName);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.accentSuffix) setAccentSuffix(data.accentSuffix);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    window.location.href = q ? `/courses?search=${encodeURIComponent(q)}` : "/courses";
  };

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)] safe-area-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-[4.25rem] lg:h-[5rem] gap-2 min-w-0">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 rounded-xl py-1 pl-0.5 pr-1 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 sm:gap-3 sm:rounded-2xl sm:pl-1 sm:pr-2"
            aria-label={`${siteName} Home`}
          >
            {logoUrl ? (
              <>
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 ring-2 ring-white shadow-md dark:from-slate-800 dark:to-slate-700 dark:ring-slate-800 sm:h-11 sm:w-11 sm:rounded-2xl">
                  <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 max-w-[6.5rem] truncate max-[359px]:hidden sm:max-w-[9rem] md:max-w-none">
                  <BrandName siteName={siteName} accentSuffix={accentSuffix} size="base" />
                </span>
              </>
            ) : (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-base font-bold text-white shadow-md shadow-blue-500/25 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-lg">
                  {siteName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 max-w-[6.5rem] truncate max-[359px]:hidden sm:max-w-[9rem] md:max-w-none">
                  <BrandName siteName={siteName} accentSuffix={accentSuffix} size="base" />
                </span>
              </>
            )}
          </Link>

          <nav
            className="hidden lg:flex items-center justify-center flex-1"
            aria-label="Main"
          >
            <div className="flex items-center gap-5 xl:gap-7">
              {navLinks.map(({ href, labelKey }) => {
                const active = isNavActive(pathname, href);
                const label = t(labelKey);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      active
                        ? "text-blue-600 dark:text-blue-400 after:absolute after:left-0 after:right-0 after:-bottom-3 after:mx-auto after:h-0.5 after:w-full after:rounded-full after:bg-blue-600 dark:after:bg-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
            <div className="relative hidden md:flex items-center">
              {searchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="flex items-center h-10 w-[min(14rem,calc(100vw-10rem))] md:w-56 rounded-2xl border border-slate-200 bg-white pl-3 pr-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.searchCourses")}
                    aria-label={t("common.searchCourses")}
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label={t("common.closeSearch")}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label={t("common.searchCourses")}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            <ThemeToggle className="hidden sm:flex !h-9 !w-9 md:!h-10 md:!w-10 !rounded-xl md:!rounded-2xl !border-slate-200/90 dark:!border-slate-600 !bg-white dark:!bg-slate-800/90 !shadow-sm" />

            <LanguageSelector compact className="hidden sm:block" />

            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl transition"
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
              >
                {t("auth.getStarted")}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition"
              aria-label={menuOpen ? t("common.closeMenu") : t("common.openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-200 ease-out ${menuOpen ? "max-h-[min(85vh,36rem)] opacity-100 overflow-y-auto overscroll-contain" : "max-h-0 opacity-0"}`}
          aria-hidden={!menuOpen}
        >
          <nav className="py-4 border-t border-slate-100 dark:border-slate-800" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, labelKey }) => {
                const active = isNavActive(pathname, href);
                const label = t(labelKey);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-3 rounded-xl font-medium text-sm transition ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm"
                onClick={() => setMenuOpen(false)}
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/signup"
                className="mx-1 mt-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-center text-sm hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-500/20"
                onClick={() => setMenuOpen(false)}
              >
                {t("auth.getStarted")}
              </Link>
              <form onSubmit={handleSearch} className="mt-3 px-1 md:hidden">
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.searchCourses")}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 px-4 text-sm font-semibold text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("common.search")}
                  </button>
                </div>
              </form>
              <div className="mt-3 space-y-2 border-t border-slate-100 px-1 pt-3 dark:border-slate-800 sm:hidden">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.language")}</span>
                  <LanguageSelector compact />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("common.theme")}</span>
                  <ThemeToggle className="!h-9 !w-9" />
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
