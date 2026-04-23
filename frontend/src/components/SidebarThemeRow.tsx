"use client";

import ThemeToggle from "@/components/ThemeToggle";

export default function SidebarThemeRow({ label = "Theme" }: { label?: string }) {
  return (
    <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200/80 dark:border-slate-700 bg-transparent">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <ThemeToggle />
    </div>
  );
}
