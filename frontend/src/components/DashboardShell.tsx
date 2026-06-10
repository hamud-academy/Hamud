"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import MobileBottomNav from "@/components/MobileBottomNav";
import StudentNav from "@/components/StudentNav";
import { useTranslation } from "@/components/LanguageProvider";
import { STUDENT_MOBILE_NAV, isStudentMorePanelActive } from "@/lib/mobile-nav-config";

type DashboardShellProps = {
  children: React.ReactNode;
  userName?: string;
  userImage?: string | null;
};

export default function DashboardShell({
  children,
  userName,
  userImage,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [siteName, setSiteName] = useState("Goltech E-Learning");
  const [logoUrl, setLogoUrl] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.siteName) setSiteName(data.siteName);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="dashboard-theme-scope min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {mobileNavOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      )}

      <aside
        className={`flex flex-col fixed inset-y-0 start-0 z-50 h-[100dvh] w-[min(85vw,16rem)] sm:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none transition-transform duration-200 ease-out lg:z-40 overscroll-contain ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative z-[60] flex items-center gap-2 border-b border-slate-100 p-4 sm:p-6 dark:border-slate-800">
          <Link
            href="/"
            onClick={closeMobileNav}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            {logoUrl ? (
              <span className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                <img src={logoUrl} alt="" className="h-full w-full object-cover" />
              </span>
            ) : (
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600 text-lg font-bold text-white">
                {siteName.charAt(0)}
              </span>
            )}
            <span className="truncate text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
              {siteName.replace(/\s+/g, " ")}
            </span>
          </Link>
          <LanguageSelector compact className="shrink-0 hidden sm:block" />
          <button
            type="button"
            onClick={closeMobileNav}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label={t("common.closeMenu")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <StudentNav onNavigate={closeMobileNav} />
        </div>
        <div className="flex-shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
            <ThemeToggle className="!h-9 !w-9 shrink-0" />
            <Link
              href="/dashboard/profile"
              onClick={closeMobileNav}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              {userImage ? (
                <img src={userImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-600 dark:text-slate-200 font-semibold text-sm">
                  {userName?.charAt(0)?.toUpperCase() ?? "S"}
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{userName ?? t("role.student")}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
              >
                {t("auth.logout")}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main: top bar + content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="flex-shrink-0 h-14 sm:h-16 lg:h-[4.25rem] flex items-center gap-2 sm:gap-4 px-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 min-w-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
            aria-label={t("common.openMenu")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 sm:hidden">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{siteName}</p>
          </div>
          <div className="hidden sm:block flex-1 max-w-xl min-w-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder={t("common.searchCoursesLessons")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ms-auto sm:ms-0">
            <ThemeToggle className="lg:hidden !h-9 !w-9" />
            <button type="button" className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t("common.notifications")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="lg:hidden px-2.5 sm:px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap"
            >
              {t("auth.logout")}
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-5 pb-24 lg:pb-5 overflow-x-clip overflow-y-auto dark:bg-slate-950">{children}</main>
      </div>

      <MobileBottomNav
        homeHref={STUDENT_MOBILE_NAV.homeHref}
        primary={STUDENT_MOBILE_NAV.primary}
        trailing={STUDENT_MOBILE_NAV.trailing}
        accent={STUDENT_MOBILE_NAV.accent}
        moreActive={isStudentMorePanelActive(pathname)}
        moreContent={(close) => <StudentNav onNavigate={close} />}
        morePanelTheme="app"
        morePanelTopClass="top-0"
        showTabLabels
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />
    </div>
  );
}
