"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import { translateCategoryName } from "@/lib/i18n";
import { formatStudyDuration } from "@/lib/i18n/format";
import type { WEEKDAY_KEYS } from "@/lib/i18n/format";
import DiplomaProgramCards from "@/app/diploma/DiplomaProgramCards";
import { buildCourseCheckoutHref } from "@/lib/diploma-checkout-utils";
import type { DiplomaProgramConfig } from "@/lib/diploma-config-defaults";

export type WeekDayData = {
  dayKey: (typeof WEEKDAY_KEYS)[number];
  dateIso: string;
  minutes: number;
  lessons: number;
};

export type RecommendedCourse = {
  id: string;
  slug: string;
  title: string;
  price: number;
  durationHours: number | null;
  thumbnail: string | null;
  categoryName: string;
  categorySlug: string;
};

type Props = {
  firstName: string;
  totalStudyMinutes: number;
  completedLessonCount: number;
  completedCount: number;
  enrollmentsCount: number;
  certificatesCount: number;
  weekDays: WeekDayData[];
  weeklyTotalLessons: number;
  weeklyTotalMinutes: number;
  maxActivity: number;
  recommended: RecommendedCourse[];
  diplomaPrograms: DiplomaProgramConfig[];
  diplomaProgramsEyebrow: string;
  diplomaProgramsTitle: string;
};

export default function DashboardHomeClient({
  firstName,
  totalStudyMinutes,
  completedLessonCount,
  completedCount,
  enrollmentsCount,
  certificatesCount,
  weekDays,
  weeklyTotalLessons,
  weeklyTotalMinutes,
  maxActivity,
  recommended,
  diplomaPrograms,
  diplomaProgramsEyebrow,
  diplomaProgramsTitle,
}: Props) {
  const { t, locale } = useTranslation();
  const displayName = firstName || t("student.defaultName");
  const now = new Date();

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-white p-5 sm:p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              {t("student.badgeStudentDashboard")}
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {t("student.welcomeBack", { name: displayName })}
            </h1>
            <p className="text-slate-600 text-sm mt-1">{t("student.dashboardSubtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-violet-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </span>
            <p className="text-right text-xl sm:text-3xl font-bold text-slate-950">
              {formatStudyDuration(totalStudyMinutes)}
            </p>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("student.timeStudied")}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
            {t("student.lessonsCompleted", { count: completedLessonCount })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-right text-xl sm:text-3xl font-bold text-slate-950">{completedCount}</p>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("student.completed")}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
            {t("student.ofEnrolledCourses", { count: enrollmentsCount })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <p className="text-right text-xl sm:text-3xl font-bold text-slate-950">{certificatesCount}</p>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("student.certificates")}
          </p>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">{t("student.earnedFromFinished")}</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-950">{t("student.weeklyActivity")}</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t("student.lessonsCompletedThisWeek", { count: weeklyTotalLessons })}
              {weeklyTotalMinutes > 0
                ? t("student.studiedThisWeek", { hours: formatStudyDuration(weeklyTotalMinutes) })
                : ""}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-600">
            {t("student.thisWeek")}
            <span className="h-2 w-2 rounded-full bg-violet-500" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 sm:gap-3 h-28 sm:h-32">
          {weekDays.map((day) => {
            const value = day.minutes || day.lessons;
            const pct = maxActivity ? (value / maxActivity) * 100 : 0;
            const date = new Date(day.dateIso);
            const isToday = date.toDateString() === now.toDateString();
            const tooltip =
              day.minutes > 0
                ? t("student.dayTooltipLessonsHours", {
                    count: day.lessons,
                    hours: formatStudyDuration(day.minutes),
                  })
                : t("student.dayTooltipLessons", { count: day.lessons });
            return (
              <div key={day.dayKey} className="flex-1 flex h-full flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end rounded-full bg-slate-100 p-1">
                  <div
                    className={`w-full rounded-full transition-all ${isToday ? "bg-violet-600" : "bg-violet-300"}`}
                    title={tooltip}
                    style={{ height: `${value ? Math.max(pct, 12) : 0}%` }}
                  />
                </div>
                <div className="text-center">
                  <span
                    className={`block text-[10px] sm:text-xs font-semibold ${isToday ? "text-violet-600" : "text-slate-500"}`}
                  >
                    {t(`student.${day.dayKey}`)}
                  </span>
                  <span className="block text-[10px] text-slate-400">{day.lessons}</span>
                </div>
              </div>
            );
          })}
        </div>
        {weeklyTotalLessons === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {t("student.noLessonsThisWeek")}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-slate-900">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t("nav.courses")}
          </h2>
          <Link href="/courses" className="text-xs sm:text-sm font-semibold text-violet-600 hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {recommended.map((course) => {
            const categoryLabel = translateCategoryName(
              locale,
              course.categorySlug,
              course.categoryName
            );
            return (
              <Link
                key={course.id}
                href={buildCourseCheckoutHref(course.slug, { fromDashboard: true })}
                className="bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition group"
              >
                <div className="aspect-video relative bg-gradient-to-br from-slate-200 to-slate-300">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm uppercase">
                      {categoryLabel.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">{categoryLabel}</p>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 mt-0.5 group-hover:text-violet-600">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">${Number(course.price).toFixed(2)}</p>
                  {course.durationHours != null && (
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      {t("student.hoursDuration", { count: Number(course.durationHours) })}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-[#eef6ff]/60 p-4 sm:p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              {diplomaProgramsEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {diplomaProgramsTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t("student.dashboardDiplomaHint")}</p>
          </div>
          <Link
            href="/dashboard/diploma"
            className="shrink-0 text-center text-sm font-semibold text-teal-600 hover:underline"
          >
            {t("student.goToDiploma")} →
          </Link>
        </div>

        {diplomaPrograms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 px-4 py-6 text-center text-sm text-slate-500">
            <p>{t("student.noDiplomaProgramsAvailable")}</p>
          </div>
        ) : (
          <DiplomaProgramCards programs={diplomaPrograms} fromDashboard />
        )}
      </section>
    </div>
  );
}
