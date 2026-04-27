"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const defaultSiteName = "BaroSmart";

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
      : "text-[1.05rem] sm:text-lg font-semibold tracking-tight";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState(defaultSiteName);
  const [logoUrl, setLogoUrl] = useState("");
  const [accentSuffix, setAccentSuffix] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    window.location.href = q ? `/courses?search=${encodeURIComponent(q)}` : "/courses";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.25rem] lg:h-[5rem] gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 min-w-0 flex-shrink-0 rounded-2xl pr-2 -ml-1 pl-1 py-1 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
            aria-label={`${siteName} Home`}
          >
            {logoUrl ? (
              <>
                <span className="relative flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 ring-2 ring-white dark:ring-slate-800 shadow-md shadow-slate-200/40 dark:shadow-slate-950/50">
                  <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                </span>
                <BrandName siteName={siteName} accentSuffix={accentSuffix} size="base" />
              </>
            ) : (
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-md shadow-blue-500/25">
                {siteName.charAt(0).toUpperCase()}
              </span>
            )}
            {logoUrl ? null : (
              <span className="min-w-0">
                <BrandName siteName={siteName} accentSuffix={accentSuffix} size="base" />
              </span>
            )}
          </Link>

          <nav
            className="hidden lg:flex items-center justify-center flex-1"
            aria-label="Main"
          >
            <div className="flex items-center gap-7">
              {navLinks.map(({ href, label }) => {
                const active = isNavActive(pathname, href);
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

          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center h-11 w-64 rounded-2xl border border-slate-200 bg-slate-100/80 px-4 text-slate-500 shadow-inner shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 dark:shadow-none"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </form>

            <ThemeToggle className="!h-10 !w-10 !rounded-2xl !border-slate-200/90 dark:!border-slate-600 !bg-white dark:!bg-slate-800/90 !shadow-sm" />

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-[#1447E6] text-white text-sm font-semibold shadow-lg shadow-[rgba(20,71,230,0.25)] hover:bg-[#0F35AD] transition"
              >
                Get Started
              </Link>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-[#1447E6] text-white text-sm font-semibold shadow-md shadow-[rgba(20,71,230,0.25)]"
              >
                Log in
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
              aria-label="Toggle menu"
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
          className={`lg:hidden overflow-hidden transition-all duration-200 ease-out ${menuOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"}`}
          aria-hidden={!menuOpen}
        >
          <nav className="py-4 border-t border-slate-100 dark:border-slate-800" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              <form onSubmit={handleSearch} className="mb-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                />
              </form>
              {navLinks.map(({ href, label }) => {
                const active = isNavActive(pathname, href);
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
                Log in
              </Link>
              <Link
                href="/signup"
                className="mx-1 mt-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-center text-sm hover:from-blue-500 hover:to-indigo-500 transition shadow-md shadow-blue-500/20"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
