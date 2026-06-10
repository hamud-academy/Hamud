"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/LanguageProvider";

const defaultConfig = {
  heroImageUrl: "",
  heroTagline: "THE FUTURE OF SOMALI E-LEARNING",
  heroHeading: "Learn quality knowledge, wherever you are",
  heroHeadingHighlight: "wherever",
  heroDescription: "Join thousands of students learning the latest skills. Build your future today.",
  heroStudentCountText: "Join 10,000+ active students",
  studentCount: 0 as number | undefined,
  studentProfiles: [] as { name: string; image: string | null }[],
};

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [config, setConfig] = useState(defaultConfig);
  const { t, locale } = useTranslation();

  useEffect(() => {
    fetch("/api/landing-config")
      .then((r) => r.json())
      .then((data) => setConfig({ ...defaultConfig, ...data }))
      .catch(() => {});
  }, [locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) window.location.href = `/courses?search=${encodeURIComponent(q)}`;
    else window.location.href = "/courses";
  };

  const { heroImageUrl, studentCount, studentProfiles } = config;

  const heroTagline = locale === "en" ? config.heroTagline : t("landing.heroTagline");
  const heroHeading = locale === "en" ? config.heroHeading : t("landing.heroHeading");
  const heroHeadingHighlight =
    locale === "en" ? config.heroHeadingHighlight : t("landing.heroHeadingHighlight");
  const heroDescription = locale === "en" ? config.heroDescription : t("landing.heroDescription");
  const heroStudentCountText =
    locale === "en" ? config.heroStudentCountText : t("landing.heroStudentCountFallback");

  const displayStudentText =
    typeof studentCount === "number" && studentCount >= 0
      ? t("landing.activeStudents", { count: studentCount })
      : heroStudentCountText;
  const highlightIdx = heroHeadingHighlight && heroHeading.includes(heroHeadingHighlight)
    ? heroHeading.indexOf(heroHeadingHighlight)
    : -1;
  const beforeHighlight = highlightIdx >= 0 ? heroHeading.slice(0, highlightIdx) : heroHeading;
  const afterHighlight = highlightIdx >= 0 ? heroHeading.slice(highlightIdx + heroHeadingHighlight.length) : "";

  return (
    <section className="relative overflow-hidden bg-white px-4 pb-14 pt-[5.5rem] sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pb-20 lg:pt-32 dark:bg-slate-950">
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-900/20" />
      <div className="pointer-events-none absolute right-8 top-24 h-72 w-72 rounded-full bg-slate-100/80 blur-3xl dark:bg-indigo-900/20" />
      <div className="relative mx-auto max-w-6xl min-w-0">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          {/* Copy: first on mobile, left on desktop */}
          <div className="text-center lg:max-w-[520px] lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900/60">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{heroTagline}</span>
            </div>

            <h1 className="mx-auto mb-5 max-w-3xl text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl lg:mx-0 lg:text-[3rem] dark:text-white">
              {beforeHighlight}
              {heroHeadingHighlight && highlightIdx >= 0 && (
                <span className="text-blue-600 dark:text-blue-400">{heroHeadingHighlight}</span>
              )}
              {afterHighlight}
            </h1>

            <p className="mx-auto mb-7 max-w-xl text-base leading-7 text-slate-600 lg:mx-0 dark:text-slate-300">
              {heroDescription}
            </p>

            <form onSubmit={handleSearch} className="mx-auto mb-7 max-w-[530px] lg:mx-0">
              <div className="flex min-h-14 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
                <div className="flex min-w-0 flex-1 items-center px-3 sm:px-4">
                  <span className="pointer-events-none text-slate-400 dark:text-slate-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("landing.searchPlaceholder")}
                    className="min-w-0 flex-1 border-0 bg-transparent px-2 sm:px-4 py-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-14 shrink-0 items-center justify-center bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 sm:px-7"
                >
                  <span className="hidden min-[400px]:inline">{t("common.search")}</span>
                  <svg className="h-5 w-5 min-[400px]:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600 lg:justify-start dark:text-slate-400">
              <div className="flex -space-x-2.5">
                {(studentProfiles && studentProfiles.length > 0
                  ? studentProfiles.slice(0, 6)
                  : [{ name: "A", image: null }, { name: "B", image: null }, { name: "C", image: null }, { name: "D", image: null }]
                ).map((student, i) => (
                  <span
                    key={i}
                    title={student.name}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white shadow-sm ring-2 ring-white dark:border-slate-700 dark:ring-slate-800"
                  >
                    {student.image ? (
                      <img src={student.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>{student.name.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-300">{displayStudentText}</span>
            </div>
          </div>

          {/* Hero image: below copy on mobile, right column on desktop */}
          <div className="relative flex w-full items-center justify-center">
            <div className="relative mx-auto w-full min-h-[13rem] overflow-hidden rounded-[1.25rem] bg-white shadow-2xl shadow-slate-200/70 sm:min-h-0 sm:max-w-none sm:rounded-[1.35rem] dark:bg-slate-900 dark:shadow-slate-950/60 aspect-[4/3] sm:aspect-[1.65/1] lg:max-w-none">
              <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] ring-1 ring-slate-200/80 sm:rounded-[1.35rem] dark:ring-slate-700/60">
                {heroImageUrl ? (
                  <img
                    src={heroImageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center sm:object-contain"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="flex aspect-video w-3/4 max-w-sm items-center justify-center rounded-xl border border-white/10 bg-slate-700/50 backdrop-blur-sm">
                        <svg className="h-14 w-14 text-white/60 sm:h-20 sm:w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[46%] rounded-lg bg-emerald-50 px-2 py-1.5 shadow-md ring-1 ring-emerald-100 sm:left-5 sm:top-7 sm:max-w-none sm:rounded-xl sm:px-4 sm:py-3 sm:shadow-lg dark:bg-emerald-950 dark:ring-emerald-900">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white sm:h-8 sm:w-8 sm:rounded-lg">
                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l4-4 3 3 5-6" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[8px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[10px] sm:tracking-[0.08em] dark:text-emerald-300">
                      {t("landing.successRate")}
                    </p>
                    <p className="text-xs font-extrabold text-slate-900 sm:text-sm dark:text-white">98.5%</p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-2 right-2 z-10 max-w-[46%] rounded-lg bg-slate-900 px-2 py-1.5 text-white shadow-lg sm:bottom-5 sm:right-5 sm:max-w-none sm:rounded-xl sm:px-4 sm:py-3 sm:shadow-xl">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600 sm:h-8 sm:w-8 sm:rounded-lg">
                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  <span className="truncate text-[8px] font-bold uppercase tracking-wide sm:text-[10px] sm:tracking-[0.08em]">
                    {t("landing.qualityCourses")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
