"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  coursesCount: number;
}

interface Props {
  categories: Category[];
  currentCategory?: string;
  currentLevel?: string;
  currentSearch?: string;
}

const LEVELS = [
  { value: "BEGINNER", label: "Beginner", hint: "Start here" },
  { value: "INTERMEDIATE", label: "Intermediate", hint: "Build skills" },
  { value: "ADVANCED", label: "Advanced", hint: "Go deeper" },
];

function buildUrl(params: Record<string, string>, updates: Partial<Record<string, string | null>>) {
  const merged = { ...params };
  Object.entries(updates).forEach(([k, v]) => {
    if (v === null || v === "") delete merged[k];
    else if (typeof v === "string") merged[k] = v;
  });
  const search = new URLSearchParams(merged);
  const q = search.toString();
  return q ? `/courses?${q}` : "/courses";
}

function getCategoryIcon(slug: string, active: boolean) {
  const cls = `w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`;
  switch (slug.toLowerCase()) {
    case "business":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "data science":
    case "data-science":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    case "design":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case "programming":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
  }
}

export default function CoursesFilters({ categories, currentCategory, currentLevel, currentSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    params[k] = v;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl(params, { search: search.trim() || null, page: null }));
    });
  };

  const clearFilters = () => {
    setSearch("");
    startTransition(() => router.push("/courses"));
  };

  const hasFilters = !!(currentCategory || currentLevel || currentSearch);
  const totalInCategories = categories.reduce((s, c) => s + c.coursesCount, 0);

  return (
    <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50 active:scale-[0.99] transition"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </span>
          Filters & search
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`${mobileOpen ? "block" : "hidden lg:block"} rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-slate-950/40 ring-1 ring-slate-900/5 dark:ring-slate-100/5 overflow-hidden`}
      >
        <div className="p-4 sm:p-5 space-y-6">
          <form onSubmit={handleSearch} className="space-y-2">
            <label htmlFor="course-search" className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Search
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0 group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  id="course-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses…"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/90 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder-slate-500 text-sm font-medium outline-none transition focus:bg-white dark:focus:bg-slate-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 transition"
              >
                {isPending ? "…" : "Search"}
              </button>
            </div>
          </form>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
                Categories
              </h3>
            </div>
            <ul className="space-y-1.5 max-h-[min(52vh,22rem)] overflow-y-auto pr-1 -mr-1">
              <li>
                <button
                  type="button"
                  onClick={() => startTransition(() => router.push(buildUrl(params, { category: null, page: null })))}
                  className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    !currentCategory
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                  }`}
                >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${!currentCategory ? "bg-white/15" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-300"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0 truncate">Dhammaan</span>
                  <span
                    className={`tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg ${
                      !currentCategory ? "bg-white/20 text-white" : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {totalInCategories}
                  </span>
                </button>
              </li>
              {categories.map((cat) => {
                const active = currentCategory === cat.slug;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => startTransition(() => router.push(buildUrl(params, { category: cat.slug, page: null })))}
                      className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20"
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                          active ? "bg-white/15 text-white" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-600"
                        }`}
                      >
                        {getCategoryIcon(cat.slug, active)}
                      </span>
                      <span className="flex-1 min-w-0 truncate">{cat.name}</span>
                      <span
                        className={`tabular-nums text-xs font-bold px-2.5 py-1 rounded-lg ${
                          active ? "bg-white/20 text-white" : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {cat.coursesCount}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Heerka
            </h3>
            <ul className="space-y-2">
              {LEVELS.map((l) => {
                const selected = currentLevel === l.value;
                return (
                  <li key={l.value}>
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(() =>
                          router.push(buildUrl(params, { level: selected ? null : l.value, page: null }))
                        )
                      }
                      className={`w-full text-left rounded-2xl border px-3.5 py-3 transition-all flex items-center gap-3 ${
                        selected
                          ? "border-blue-400/80 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/30 shadow-sm shadow-blue-500/10 ring-2 ring-blue-500/20 dark:ring-blue-500/30"
                          : "border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 rounded-full border-2 shrink-0 items-center justify-center transition-colors ${
                          selected ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-semibold ${selected ? "text-blue-900 dark:text-blue-100" : "text-slate-800 dark:text-slate-200"}`}>
                          {l.label}
                        </span>
                        <span className={`block text-xs mt-0.5 ${selected ? "text-blue-700/80 dark:text-blue-300/90" : "text-slate-500 dark:text-slate-400"}`}>
                          {l.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
