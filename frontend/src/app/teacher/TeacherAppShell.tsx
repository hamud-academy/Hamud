"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import TeacherNav from "./TeacherNav";
import SidebarThemeRow from "@/components/SidebarThemeRow";

type Props = {
  children: ReactNode;
  siteName: string;
  logoUrl: string;
  userName: string;
  userImage: string | null;
};

export default function TeacherAppShell({ children, siteName, logoUrl, userName, userImage }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex-shrink-0 p-5 border-b border-slate-100 dark:border-slate-800">
          <Link href="/teacher" className="flex items-center gap-3" onClick={closeNav}>
            <span className="relative w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
              {logoUrl ? (
                <Image src={logoUrl} alt="" fill className="object-cover" unoptimized={logoUnopt} />
              ) : (
                siteName.charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">{siteName}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Teacher</span>
            </div>
          </Link>
        </div>
        <TeacherNav onNavigate={closeNav} />
        <SidebarThemeRow label="Theme" />
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
                Log out
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-screen w-full lg:ml-64 pt-14 lg:pt-0 px-4 sm:px-6 md:pl-8 md:pr-8 dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}
