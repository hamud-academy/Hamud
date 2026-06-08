"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";

type Props = {
  page: number;
  totalPages: number;
  prevHref: string | null;
  nextHref: string | null;
};

export default function CoursesPagination({ page, totalPages, prevHref, nextHref }: Props) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-wrap justify-center items-center gap-3 mt-10 sm:mt-12">
      {prevHref && (
        <Link
          href={prevHref}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 text-sm font-semibold shadow-sm transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          ← {t("courses.previous")}
        </Link>
      )}
      <span className="px-4 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium tabular-nums">
        {t("courses.pageOf", { page, total: totalPages })}
      </span>
      {nextHref && (
        <Link
          href={nextHref}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 text-sm font-semibold shadow-sm transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {t("courses.next")} →
        </Link>
      )}
    </nav>
  );
}
