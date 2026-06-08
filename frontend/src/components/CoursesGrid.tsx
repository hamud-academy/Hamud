"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import { translateCategoryName } from "@/lib/i18n";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  originalPrice: number | null;
  durationHours: number | null;
  category: { name: string; slug: string };
  instructor: { name: string | null };
  _count: { enrollments: number };
}

interface Props {
  courses: Course[];
}

export default function CoursesGrid({ courses }: Props) {
  const { t, locale } = useTranslation();

  function formatDuration(hours: number | null) {
    if (!hours) return "—";
    if (hours >= 24) return `${Math.round(hours / 24)} ${t("common.weeks")}`;
    return `${hours}${t("common.hours")}`;
  }

  function formatStudents(count: number) {
    if (count >= 1000) return t("common.studentsCountK", { count: (count / 1000).toFixed(1) });
    return t("common.studentsCount", { count });
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t("courses.noResults")}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">{t("courses.tryFilter")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {courses.map((course) => {
        const categoryLabel = translateCategoryName(locale, course.category.slug, course.category.name);
        return (
          <article
            key={course.id}
            className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition"
          >
            <Link href={`/courses/${course.slug}`} className="block aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-400 uppercase">
                  {course.category.slug.slice(0, 2)}
                </div>
              )}
            </Link>
            <div className="p-5 flex flex-col flex-1">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg w-fit">
                {categoryLabel.toUpperCase()}
              </span>
              <div className="flex gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{formatDuration(course.durationHours)}</span>
                <span>•</span>
                <span>{formatStudents(course._count.enrollments)}</span>
              </div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mt-2 line-clamp-2 group-hover:text-blue-600 transition">
                <Link href={`/courses/${course.slug}`}>{course.title}</Link>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 shrink-0" />
                <span className="truncate font-medium">{course.instructor.name ?? t("common.unknown")}</span>
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900 dark:text-white ltr-only">${course.price.toFixed(2)}</span>
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t("common.viewCourse")} →
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
