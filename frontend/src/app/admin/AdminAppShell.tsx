"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminNav from "./AdminNav";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useTranslation } from "@/components/LanguageProvider";
import { ADMIN_MOBILE_NAV, isAdminMorePanelActive } from "@/lib/mobile-nav-config";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
  siteName: string;
  logoUrl: string;
  userName: string;
  userImage: string | null;
  role?: string;
};

export default function AdminAppShell({ children, siteName, logoUrl, userName, userImage, role }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const pathname = usePathname();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeNav = () => setMobileOpen(false);
  const logoUnopt = logoUrl.startsWith("http") && logoUrl.includes("localhost");
  const imgUnopt = userImage ? userImage.startsWith("http") && userImage.includes("localhost") : false;

  return (
    <div className="dashboard-theme-scope min-h-screen flex bg-white dark:bg-slate-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-[#F8F8F8]/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 sm:px-4 safe-area-top">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={t("common.openMenu")}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/admin" className="flex items-center gap-2 min-w-0 flex-1" onClick={closeNav}>
          <span className="relative w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
            {logoUrl ? (
              <Image src={logoUrl} alt="" fill className="object-cover" unoptimized={logoUnopt} />
            ) : (
              siteName.charAt(0).toUpperCase()
            )}
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{siteName}</span>
        </Link>
        <ThemeToggle className="!h-9 !w-9 shrink-0" />
        <LanguageSelector compact />
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          aria-label="Close menu"
          onClick={closeNav}
        />
      )}

      <aside
        className={`fixed inset-y-0 start-0 z-50 flex h-[100dvh] w-[min(85vw,16rem)] sm:w-[260px] flex-col bg-[#F8F8F8] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-none transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative z-[60] flex-shrink-0 overflow-visible p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-3" onClick={closeNav}>
              <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-blue-600 flex items-center justify-center text-lg font-bold text-white">
                {logoUrl ? (
                  <Image src={logoUrl} alt="" fill className="object-cover" unoptimized={logoUnopt} />
                ) : (
                  siteName.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{siteName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t("role.adminSystem")}</span>
              </div>
            </Link>
            <LanguageSelector compact className="shrink-0 hidden sm:block" />
            <button
              type="button"
              onClick={closeNav}
              className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label={t("common.closeMenu")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <AdminNav role={role} onNavigate={closeNav} />
        </div>
        <div className="flex-shrink-0 p-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <span className="relative w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-200 text-sm overflow-hidden flex-shrink-0">
              {userImage ? (
                <Image src={userImage} alt="" fill className="object-cover" unoptimized={imgUnopt} />
              ) : (
                userName[0]?.toUpperCase() ?? "A"
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("role.superAdmin")}</p>
            </div>
            <ThemeToggle className="!h-8 !w-8 shrink-0" />
            <Link
              href="/api/auth/signout"
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/80 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              aria-label={t("auth.logout")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-screen min-w-0 w-full lg:ml-[260px] pt-14 lg:pt-0 pb-24 lg:pb-0 dark:bg-slate-950 overflow-x-clip">
        {children}
      </main>

      <MobileBottomNav
        homeHref={ADMIN_MOBILE_NAV.homeHref}
        primary={ADMIN_MOBILE_NAV.primary}
        accent={ADMIN_MOBILE_NAV.accent}
        moreActive={isAdminMorePanelActive(pathname)}
        moreContent={(close) => <AdminNav role={role} onNavigate={close} />}
        signOutHref="/api/auth/signout"
      />
    </div>
  );
}
