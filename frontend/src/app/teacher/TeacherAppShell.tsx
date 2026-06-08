"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import TeacherNav from "./TeacherNav";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useTranslation } from "@/components/LanguageProvider";
import { TEACHER_MOBILE_NAV } from "@/lib/mobile-nav-config";

type Props = {
  children: ReactNode;
  siteName: string;
  logoUrl: string;
  userName: string;
  userImage: string | null;
};

export default function TeacherAppShell({ children, siteName, logoUrl, userName, userImage }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

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
    <div className="dashboard-theme-scope min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 shadow-sm">
        <Link href="/teacher" className="flex items-center gap-2 min-w-0 flex-1" onClick={closeNav}>
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
        className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative z-[60] flex-shrink-0 overflow-visible p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <Link href="/teacher" className="flex min-w-0 flex-1 items-center gap-3" onClick={closeNav}>
              <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-blue-600 flex items-center justify-center text-lg font-bold text-white">
                {logoUrl ? (
                  <Image src={logoUrl} alt="" fill className="object-cover" unoptimized={logoUnopt} />
                ) : (
                  siteName.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{siteName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t("role.teacher")}</span>
              </div>
            </Link>
            <LanguageSelector compact className="shrink-0" />
          </div>
        </div>
        <TeacherNav onNavigate={closeNav} />
        <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div className="flex items-center gap-3">
            <span className="relative w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
              {userImage ? (
                <Image src={userImage} alt="" fill className="object-cover" unoptimized={imgUnopt} />
              ) : (
                userName[0]?.toUpperCase() ?? "T"
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{userName}</p>
              <Link
                href="/api/auth/signout"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                {t("auth.logout")}
              </Link>
            </div>
            <ThemeToggle className="!h-8 !w-8 shrink-0" />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-screen w-full lg:ml-64 pt-14 lg:pt-0 px-4 sm:px-6 md:pl-8 md:pr-8 pb-24 lg:pb-8 dark:bg-slate-950">
        {children}
      </main>

      <MobileBottomNav
        homeHref={TEACHER_MOBILE_NAV.homeHref}
        primary={TEACHER_MOBILE_NAV.primary}
        accent={TEACHER_MOBILE_NAV.accent}
        more={TEACHER_MOBILE_NAV.more}
        signOutHref="/api/auth/signout"
      />
    </div>
  );
}
