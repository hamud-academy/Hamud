"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/dashboard/courses", label: "My Courses", icon: "book" },
  { href: "/dashboard/achievements", label: "Achievements", icon: "trophy" },
  { href: "/dashboard/profile", label: "Profile", icon: "user" },
  { href: "/dashboard/testimony", label: "Testimony", icon: "quote" },
];

function NavIcon({ type }: { type: string }) {
  const c = "w-5 h-5 shrink-0";
  if (type === "grid")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  if (type === "book")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  if (type === "trophy")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  if (type === "user")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  if (type === "quote")
    return (
      <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20v-4a7 7 0 017-7h4c2.21 0 4 1.79 4 4z" />
      </svg>
    );
  return null;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {mobileNavOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      )}

      <aside
        className={`flex flex-col fixed inset-y-0 left-0 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-out z-50 lg:z-40 overscroll-contain ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link
          href="/"
          onClick={closeMobileNav}
          className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800"
        >
          {logoUrl ? (
            <span className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              <img src={logoUrl} alt="" className="w-full h-full object-cover" />
            </span>
          ) : (
            <span className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {siteName.charAt(0)}
            </span>
          )}
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide truncate">{siteName.replace(/\s+/g, " ")}</span>
        </Link>
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const active =
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.href === "/dashboard/courses" && (pathname === "/dashboard/courses" || pathname.startsWith("/dashboard/courses/"))) ||
              (item.href !== "/dashboard" && item.href !== "/dashboard/courses" && pathname === item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileNav}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <NavIcon type={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <ThemeToggle className="!h-9 !w-9 shrink-0" />
            <Link
              href="/dashboard/profile"
              onClick={closeMobileNav}
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-600 dark:text-slate-200 font-semibold text-sm">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "S"}
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{session?.user?.name ?? "Student"}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main: top bar + content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="flex-shrink-0 h-16 lg:h-[4.25rem] flex items-center gap-2 sm:gap-4 px-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 min-w-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0"
            aria-label="Open navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 max-w-xl min-w-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search for courses, lessons..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle className="lg:hidden !h-9 !w-9" />
            <button type="button" className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="lg:hidden px-2.5 sm:px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 font-medium text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-5 overflow-auto dark:bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
