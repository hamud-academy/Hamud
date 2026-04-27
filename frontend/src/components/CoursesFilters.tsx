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
    <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/70 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 dark:ring-slate-800/80 sm:p-4">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-10 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 14.414V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-xl">
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <div className="group relative min-w-0 flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                id="course-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/90 py-2 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/35 disabled:translate-y-0 disabled:opacity-60"
            >
              {isPending ? "..." : "Search"}
            </button>
          </form>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </span>
              Categories
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => startTransition(() => router.push(buildUrl(params, { category: null, page: null })))}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                  !currentCategory
                    ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${!currentCategory ? "bg-white/15" : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300"}`}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </span>
                Dhammaan
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${!currentCategory ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}>
                  {totalInCategories}
                </span>
              </button>

              {categories.map((cat) => {
                const active = currentCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => startTransition(() => router.push(buildUrl(params, { category: cat.slug, page: null })))}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                      active
                        ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${active ? "bg-white/15" : "bg-slate-100 dark:bg-slate-900"}`}>
                      {getCategoryIcon(cat.slug, active)}
                    </span>
                    {cat.name}
                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}>
                      {cat.coursesCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 lg:w-80">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Heerka
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-3">
              {LEVELS.map((level) => {
                const selected = currentLevel === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() =>
                      startTransition(() =>
                        router.push(buildUrl(params, { level: selected ? null : level.value, page: null }))
                      )
                    }
                    className={`rounded-xl border px-2.5 py-2 text-left transition-all ${
                      selected
                        ? "border-blue-400 bg-blue-50 text-blue-900 shadow-sm shadow-blue-500/10 ring-4 ring-blue-500/10 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100"
                        : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-900"
                        }`}
                      >
                        {selected && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {level.label}
                    </span>
                    <span className={`mt-0.5 block pl-6 text-[11px] ${selected ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}>
                      {level.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
