"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-950/80 shadow-[0_1px_0_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[3.75rem] lg:h-[4.5rem] gap-4">
          <Link
            href="/"
            className="group flex items-center gap-3 min-w-0 flex-shrink-0 rounded-xl pr-2 -ml-1 pl-1 py-1 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
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
            className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 max-w-[min(100%,28rem)]"
            aria-label="Main"
          >
            <div className="flex items-center gap-0.5 p-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/80 shadow-inner shadow-slate-200/20 dark:shadow-none">
              {navLinks.map(({ href, label }) => {
                const active = isNavActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-3.5 lg:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                      active
                        ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-700/70"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-2.5 flex-shrink-0">
            <ThemeToggle className="!h-9 !w-9 !rounded-xl !border-slate-200/90 dark:!border-slate-600 !bg-white dark:!bg-slate-800/90 !shadow-sm" />

            {status === "authenticated" ? (
              <>
                <div className="hidden sm:flex items-center gap-1 rounded-2xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50/80 dark:bg-slate-900/50 p-1 pr-1.5 shadow-sm">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-600/50 text-slate-800 dark:text-slate-100 text-sm font-medium hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition max-w-[11rem]"
                  >
                    <span className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-600 dark:to-slate-700 flex-shrink-0 flex items-center justify-center ring-1 ring-slate-200/80 dark:ring-slate-600">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 dark:text-slate-200 font-semibold text-xs">
                          {(session?.user?.name ?? "A").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="truncate">{session?.user?.name ?? "Account"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition"
                    aria-label="Log out"
                  >
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden lg:inline">Log out</span>
                  </button>
                </div>

                <Link
                  href="/dashboard"
                  className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden ring-2 ring-slate-200/90 dark:ring-slate-600 shadow-sm"
                  aria-label="Dashboard"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                      {(session?.user?.name ?? "A").charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
              </>
            ) : null}

            {status !== "authenticated" && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {status !== "authenticated" && (
              <div className="flex sm:hidden items-center gap-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25"
                >
                  Start
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
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
          className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${menuOpen ? "max-h-[24rem] opacity-100" : "max-h-0 opacity-0"}`}
          aria-hidden={!menuOpen}
        >
          <nav className="py-4 border-t border-slate-100 dark:border-slate-800" aria-label="Mobile">
            <div className="flex flex-col gap-1">
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
              {status === "authenticated" && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center ring-1 ring-slate-300/50 dark:ring-slate-500">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 dark:text-slate-200 font-semibold text-sm">
                          {(session?.user?.name ?? "A").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    {session?.user?.name ?? "Account"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </button>
                </>
              )}
              {status !== "authenticated" && (
                <>
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
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
