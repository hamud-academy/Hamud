"use client";

import { useTranslation } from "@/components/LanguageProvider";

type Props = {
  total: number;
};

export default function CoursesPageIntro({ total }: Props) {
  const { t } = useTranslation();
  const resultsLabel = total === 1 ? t("courses.result") : t("courses.results");

  return (
    <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600/90 dark:text-blue-400 mb-1">
          {t("courses.catalog")}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t("courses.title")}</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm max-w-xl leading-6">{t("courses.subtitle")}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center rounded-full bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 me-2" aria-hidden />
          {total} {resultsLabel}
        </span>
      </div>
    </div>
  );
}
