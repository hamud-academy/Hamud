"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/components/LanguageProvider";
import { formatLocaleDate } from "@/lib/i18n/format";

export type CompletedEnrollment = {
  id: string;
  updatedAtIso: string;
  course: {
    title: string;
    slug: string;
    thumbnail: string | null;
    categoryName: string;
  };
};

export type TranscriptEntry = {
  programId: string;
  programTitle: string;
  subjectId: string;
  subjectTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  submittedAtIso: string;
};

export type DiplomaCertificate = {
  programId: string;
  programTitle: string;
  completedAtIso: string;
  certificateUrl: string;
};

type Props = {
  completedEnrollments: CompletedEnrollment[];
  transcript: TranscriptEntry[];
  diplomaCertificates: DiplomaCertificate[];
};

export default function DashboardAchievementsClient({
  completedEnrollments,
  transcript,
  diplomaCertificates,
}: Props) {
  const { t, locale } = useTranslation();

  const transcriptByProgram = useMemo(() => {
    const map = new Map<string, { programTitle: string; entries: TranscriptEntry[] }>();
    for (const entry of transcript) {
      const group = map.get(entry.programId);
      if (group) {
        group.entries.push(entry);
      } else {
        map.set(entry.programId, { programTitle: entry.programTitle, entries: [entry] });
      }
    }
    return Array.from(map.entries()).map(([programId, group]) => ({
      programId,
      programTitle: group.programTitle,
      entries: group.entries.sort(
        (a, b) => new Date(b.submittedAtIso).getTime() - new Date(a.submittedAtIso).getTime()
      ),
    }));
  }, [transcript]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-violet-600 transition"
        >
          {t("student.backToDashboard")}
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">{t("student.achievementsTitle")}</h1>
      <p className="text-slate-600 text-sm mb-8">{t("student.achievementsSubtitle")}</p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {t("student.completedCourses")}
        </h2>
        {completedEnrollments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-slate-500 text-sm">{t("student.noCompletedYet")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {completedEnrollments.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/dashboard/courses/${e.course.slug}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-sm transition"
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {e.course.thumbnail ? (
                      <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 font-bold text-sm">
                        {e.course.categoryName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{e.course.title}</p>
                    <p className="text-xs text-slate-500">{e.course.categoryName}</p>
                  </div>
                  <span className="flex-shrink-0 text-emerald-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </span>
          {t("student.certificatesSection")}
        </h2>
        {completedEnrollments.length === 0 && diplomaCertificates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-slate-500 text-sm">{t("student.completeForCerts")}</p>
            <p className="text-slate-400 text-xs mt-2">{t("student.noDiplomaCertificatesYet")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {diplomaCertificates.map((d) => (
              <div
                key={d.programId}
                className="bg-white rounded-xl border border-violet-200 p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                    {t("student.diplomaCertificate")}
                  </p>
                  <p className="font-semibold text-slate-900 mt-0.5 line-clamp-2">{d.programTitle}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("student.issued", {
                      date: formatLocaleDate(locale, new Date(d.completedAtIso)),
                    })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={d.certificateUrl}
                      className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                    >
                      {t("student.downloadDiplomaCertificate")}
                    </Link>
                    <Link
                      href={`${d.certificateUrl}?preview=1`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t("student.preview")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {completedEnrollments.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                    {t("student.courseCertificate")}
                  </p>
                  <p className="font-semibold text-slate-900 mt-0.5 line-clamp-2">{e.course.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("student.issued", {
                      date: formatLocaleDate(locale, new Date(e.updatedAtIso)),
                    })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/api/certificates/${e.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                    >
                      {t("student.downloadCertificate")}
                    </Link>
                    <Link
                      href={`/api/certificates/${e.id}?preview=1`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t("student.preview")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </span>
              {t("student.transcriptSection")}
            </h2>
            <p className="text-slate-600 text-sm ml-10">{t("student.transcriptSubtitle")}</p>
          </div>
          {transcript.length > 0 ? (
            <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
              <Link
                href="/api/dashboard/diploma/transcript"
                className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                {t("student.downloadTranscript")}
              </Link>
              <Link
                href="/api/dashboard/diploma/transcript?preview=1"
                target="_blank"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t("student.previewTranscript")}
              </Link>
            </div>
          ) : null}
        </div>

        {transcript.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-slate-500 text-sm mb-4">{t("student.noTranscriptYet")}</p>
            <Link
              href="/dashboard/diploma"
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              {t("student.goToDiploma")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {transcriptByProgram.map((group) => (
              <div
                key={group.programId}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold text-slate-900">{group.programTitle}</h3>
                  <Link
                    href={`/api/dashboard/diploma/transcript?programId=${encodeURIComponent(group.programId)}`}
                    className="inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    {t("student.downloadProgramTranscript")}
                  </Link>
                </div>
                <div className="responsive-data-table">
                  <table className="w-full text-sm text-start">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">{t("student.transcriptColSubject")}</th>
                        <th className="px-4 py-3">{t("student.transcriptColScore")}</th>
                        <th className="px-4 py-3">{t("student.transcriptColResult")}</th>
                        <th className="px-4 py-3">{t("student.transcriptColCorrect")}</th>
                        <th className="px-4 py-3">{t("student.transcriptColDate")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.entries.map((entry) => (
                        <tr key={`${entry.programId}-${entry.subjectId}`} className="text-slate-700">
                          <td data-label={t("student.transcriptColSubject")} className="px-4 py-3 font-medium text-slate-900">
                            {entry.subjectTitle}
                          </td>
                          <td data-label={t("student.transcriptColScore")} className="px-4 py-3">
                            <span className="font-bold text-slate-950">{entry.score}%</span>
                          </td>
                          <td data-label={t("student.transcriptColResult")} className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                entry.passed
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {entry.passed ? t("student.passed") : t("student.failed")}
                            </span>
                          </td>
                          <td data-label={t("student.transcriptColCorrect")} className="px-4 py-3 text-slate-600">
                            {entry.correctCount}/{entry.totalQuestions}
                          </td>
                          <td data-label={t("student.transcriptColDate")} className="px-4 py-3 text-slate-500">
                            {formatLocaleDate(locale, new Date(entry.submittedAtIso))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Link
                href="/dashboard/diploma"
                className="text-sm font-semibold text-violet-600 hover:underline"
              >
                {t("student.goToDiploma")} →
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
