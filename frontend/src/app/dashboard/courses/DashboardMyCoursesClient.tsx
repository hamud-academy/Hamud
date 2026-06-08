"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";

export type EnrollmentRow = {
  id: string;
  progress: number;
  course: {
    title: string;
    slug: string;
    thumbnail: string | null;
    categoryName: string;
  };
  totalLessons: number;
  currentLesson: number;
};

type Props = {
  enrollments: EnrollmentRow[];
};

export default function DashboardMyCoursesClient({ enrollments }: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("student.myCoursesTitle")}</h1>
        <p className="text-slate-600 text-sm mt-0.5">{t("student.myCoursesSubtitle")}</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">{t("student.notEnrolledYet")}</p>
          <p className="text-slate-500 text-sm mb-6">{t("student.browseCoursesHint")}</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition shadow-sm"
          >
            {t("student.browseCourses")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/dashboard/courses/${e.course.slug}`}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition flex flex-col sm:flex-row"
            >
              <div className="w-full sm:w-44 lg:w-52 flex-shrink-0 aspect-video sm:aspect-auto sm:h-[140px] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                {e.course.thumbnail ? (
                  <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg uppercase">
                    {e.course.categoryName.slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-center">
                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                  {e.course.categoryName}
                </span>
                <h2 className="font-bold text-slate-900 text-lg mt-1 line-clamp-2">{e.course.title}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {t("student.lessonProgress", { current: e.currentLesson, total: e.totalLessons })}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-violet-600">
                  {t("student.continueLearning")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
