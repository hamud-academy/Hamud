"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const icons = {
  dashboard: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V6zM14 16a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2z",
  requests: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  courses: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  students: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  createAccount: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  systemConfig: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  contact: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  about: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

const mainNav = [
  { href: "/admin", label: "Dashboard", icon: icons.dashboard },
  { href: "/admin/requests", label: "Requests", icon: icons.requests },
  { href: "/admin/courses", label: "Courses", icon: icons.courses },
  { href: "/admin/students", label: "Students", icon: icons.students },
];

const configNav = [
  { href: "/admin/accounts", label: "Create Accounts", icon: icons.createAccount },
  { href: "/admin/system-config", label: "System Config", icon: icons.systemConfig },
  { href: "/admin/contact-config", label: "Contact Config", icon: icons.contact },
  { href: "/admin/about-config", label: "About Config", icon: icons.about },
  { href: "/admin/settings", label: "Settings", icon: icons.settings },
];

function NavLink({
  href,
  label,
  icon,
  isActive,
  onNavigate,
}: { href: string; label: string; icon: string; isActive: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm ${
        isActive
          ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80"
      }`}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {label}
    </Link>
  );
}

export default function AdminNav({ role, onNavigate }: { role?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [systemConfigOpen, setSystemConfigOpen] = useState(
    pathname.startsWith("/admin/system-config") || pathname.startsWith("/admin/categories")
  );

  useEffect(() => {
    if (pathname.startsWith("/admin/system-config") || pathname.startsWith("/admin/categories")) {
      setSystemConfigOpen(true);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav className="p-3 space-y-1">
      {mainNav.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={isActive(item.href)}
          onNavigate={onNavigate}
        />
      ))}

      <div className="pt-4 pb-1">
        <p className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Configuration
        </p>
      </div>
      {configNav.map((item) => {
        if (item.href === "/admin/system-config") {
          const active =
            pathname.startsWith("/admin/system-config") || pathname.startsWith("/admin/categories");
          return (
            <div key={item.href}>
              <button
                type="button"
                onClick={() => setSystemConfigOpen((o) => !o)}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm ${
                  active
                    ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="flex-1 text-left">{item.label}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${systemConfigOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {systemConfigOpen && (
                <div className="ml-4 mt-0.5 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
                  {[
                    { href: "/admin/categories", label: "Most Popular Categories" },
                    { href: "/admin/system-config/logo", label: "Change Logo" },
                    { href: "/admin/system-config/name", label: "Change Name" },
                    { href: "/admin/system-config/fav-icon", label: "Fav icon" },
                    { href: "/admin/system-config/hero-photo", label: "Change Hero Photo" },
                    { href: "/admin/system-config/texts", label: "Change Texts" },
                  ].map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => onNavigate?.()}
                      className={`flex items-center gap-2 py-2.5 rounded-lg font-medium transition text-sm ${
                        pathname === child.href
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.href)}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
