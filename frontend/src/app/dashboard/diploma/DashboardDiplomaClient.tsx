"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/components/LanguageProvider";
import { formatLocaleDate } from "@/lib/i18n/format";
import type { DiplomaExamResult } from "@/lib/diploma-exam-results";

type Program = {
  id: string;
  title: string;
  summary: string;
  completion: {
    completed: boolean;
    completedAtIso: string | null;
    certificateUrl: string | null;
  };
  subjects: {
    id: string;
    title: string;
    code: string;
    description: string;
    guidedMode: boolean;
    modules: {
      id: string;
      title: string;
      order: number;
      lessons: { id: string; title: string; duration: string; completed: boolean; released: boolean }[];
    }[];
    progress: {
      completedCount: number;
      totalLessons: number;
      progress: number;
      curriculumComplete: boolean;
    };
    exam: {
      title: string;
      passingScore: number;
      questions: { id: string; prompt: string; options: { id: string; text: string }[] }[];
    };
  }[];
};

function lessonCount(subject: Program["subjects"][number]) {
  return subject.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export default function DashboardDiplomaClient({
  programs,
  initialResults,
}: {
  programs: Program[];
  initialResults: DiplomaExamResult[];
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [results, setResults] = useState(initialResults);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});

  const resultBySubject = useMemo(() => {
    const map = new Map<string, DiplomaExamResult>();
    results.forEach((result) => map.set(`${result.programId}:${result.subjectId}`, result));
    return map;
  }, [results]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash.startsWith("subject-")) return;
    const subjectId = hash.replace("subject-", "");
    const program = programs.find((p) => p.subjects.some((s) => s.id === subjectId));
    if (program) {
      setExpandedPrograms((prev) => ({ ...prev, [program.id]: true }));
    }
  }, [programs]);

  function toggleProgram(programId: string) {
    setExpandedPrograms((prev) => ({ ...prev, [programId]: !prev[programId] }));
  }

  async function submitExam(programId: string, subjectId: string) {
    const key = `${programId}:${subjectId}`;
    setSubmittingKey(key);
    setMessage(null);
    try {
      const res = await fetch(`/api/dashboard/diploma/exams/${programId}/${subjectId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answers[key] ?? {} }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? t("student.examSubmitFailed") });
        return;
      }

      setResults((current) => [
        ...current.filter((result) => !(result.programId === programId && result.subjectId === subjectId)),
        data,
      ]);
      setMessage({
        type: "ok",
        text: data.programCompleted
          ? t("student.examSubmittedDiplomaComplete")
          : t("student.examSubmitted"),
      });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: t("student.examConnectionError") });
    } finally {
      setSubmittingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">{t("student.diplomaBadge")}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{t("student.diplomaProgramsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("student.diplomaProgramsSubtitle")}</p>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          <p className="font-semibold text-slate-700">{t("student.noDiplomaEnrolled")}</p>
          <p className="mt-2 text-sm">{t("student.noDiplomaEnrolledHint")}</p>
        </div>
      ) : (
        programs.map((program) => {
          const isExpanded = !!expandedPrograms[program.id];
          return (
          <section key={program.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProgram(program.id)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? t("student.collapseProgram") : t("student.expandProgram")}
              className="flex w-full items-start justify-between gap-4 p-5 text-start transition hover:bg-slate-50/80"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-950">{program.title}</h2>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{program.summary}</p>
                {!isExpanded && program.subjects.length > 0 ? (
                  <p className="mt-2 text-xs font-medium text-violet-600">
                    {t("student.diplomaSubjectsCount", { count: program.subjects.length })}
                  </p>
                ) : null}
                {program.completion.completed && program.completion.certificateUrl ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    {t("student.diplomaCompletedBadge")}
                  </p>
                ) : null}
              </div>
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isExpanded ? (
            <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
              {program.completion.completed && program.completion.certificateUrl ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-emerald-800">{t("student.diplomaCertificateReady")}</p>
                    {program.completion.completedAtIso ? (
                      <p className="text-sm text-emerald-700 mt-0.5">
                        {t("student.issued", {
                          date: formatLocaleDate(locale, new Date(program.completion.completedAtIso)),
                        })}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={program.completion.certificateUrl}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      {t("student.downloadDiplomaCertificate")}
                    </Link>
                    <Link
                      href={`${program.completion.certificateUrl}?preview=1`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100/50"
                    >
                      {t("student.preview")}
                    </Link>
                  </div>
                </div>
              ) : null}
              {program.subjects.map((subject) => {
                const key = `${program.id}:${subject.id}`;
                const result = resultBySubject.get(key);
                const examAvailable = subject.exam.questions.length > 0;
                const totalLessons = lessonCount(subject);
                const examUnlocked = subject.progress.curriculumComplete;

                return (
                  <div
                    key={subject.id}
                    id={`subject-${subject.id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 scroll-mt-24"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                          {subject.code}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">{subject.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{subject.description}</p>
                      </div>
                      {result && examUnlocked && (
                        <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
                          <p className="text-2xl font-black text-slate-950">{result.score}%</p>
                          <p
                            className={`text-xs font-bold ${result.passed ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {result.passed ? t("student.passed") : t("student.failed")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h4 className="text-sm font-bold text-slate-800">
                          {totalLessons === 1
                            ? t("student.curriculumTitleOne")
                            : t("student.curriculumTitle", { count: totalLessons })}
                        </h4>
                        {totalLessons > 0 ? (
                          <p className="text-xs font-medium text-slate-500">
                            {t("student.progressCompleted", {
                              done: subject.progress.completedCount,
                              total: subject.progress.totalLessons,
                              percent: subject.progress.progress,
                            })}
                          </p>
                        ) : null}
                      </div>

                      {totalLessons > 0 ? (
                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-violet-600 transition-all"
                            style={{ width: `${subject.progress.progress}%` }}
                          />
                        </div>
                      ) : null}

                      {subject.modules.length === 0 || totalLessons === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                          {t("student.lessonsNotAdded")}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {subject.modules.map((module, moduleIndex) => (
                            <div
                              key={module.id}
                              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                            >
                              <div className="px-4 py-3 bg-slate-50 font-medium text-slate-900 text-sm">
                                {t("student.moduleTitle", { index: moduleIndex + 1, title: module.title })}
                              </div>
                              <ul className="divide-y divide-slate-100">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <li key={lesson.id}>
                                    {lesson.released ? (
                                    <Link
                                      href={`/dashboard/diploma/${program.id}/subjects/${subject.id}/lessons/${lesson.id}`}
                                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm transition"
                                    >
                                      <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                          lesson.completed
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                      >
                                        {lesson.completed ? "✓" : lessonIndex + 1}
                                      </span>
                                      <span className={`font-medium ${lesson.completed ? "text-slate-500 line-through" : ""}`}>
                                        {lesson.title}
                                      </span>
                                      {lesson.duration ? (
                                        <span className="text-slate-400 ml-auto">{lesson.duration}</span>
                                      ) : null}
                                    </Link>
                                    ) : (
                                    <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                      </span>
                                      <span className="font-medium text-slate-500">{lesson.title}</span>
                                      <span className="ml-auto text-xs font-semibold text-amber-600">
                                        {t("student.lessonLocked")}
                                      </span>
                                    </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-3">
                        {t("student.finalExam")}
                      </p>

                      {!examAvailable ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                          {t("student.examNotReady")}
                        </p>
                      ) : !examUnlocked ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                          <p className="font-semibold">{t("student.examLocked")}</p>
                          <p className="mt-1 text-amber-800">
                            {subject.guidedMode &&
                            subject.modules.some((module) =>
                              module.lessons.some((lesson) => !lesson.released)
                            )
                              ? t("student.examLockedGuidedHint")
                              : subject.progress.totalLessons === 1
                                ? t("student.examLockedHintOne", {
                                    done: subject.progress.completedCount,
                                  })
                                : t("student.examLockedHint", {
                                    total: subject.progress.totalLessons,
                                    done: subject.progress.completedCount,
                                  })}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-bold text-slate-800">
                              {t("student.examPassMark", {
                                title: subject.exam.title,
                                score: subject.exam.passingScore,
                              })}
                            </p>
                            {result && (
                              <p className="text-xs text-slate-500">
                                {t("student.correctCount", {
                                  correct: result.correctCount,
                                  total: result.totalQuestions,
                                  date: formatLocaleDate(locale, new Date(result.submittedAt)),
                                })}
                              </p>
                            )}
                          </div>

                          {subject.exam.questions.map((question, questionIndex) => (
                            <div key={question.id} className="rounded-xl border border-slate-200 bg-white p-4">
                              <p className="font-semibold text-slate-900">
                                {questionIndex + 1}. {question.prompt}
                              </p>
                              <div className="mt-3 grid gap-2">
                                {question.options.map((option) => (
                                  <label
                                    key={option.id}
                                    className="flex items-center gap-2 text-sm text-slate-700"
                                  >
                                    <input
                                      type="radio"
                                      name={`${key}-${question.id}`}
                                      checked={(answers[key]?.[question.id] ?? "") === option.id}
                                      onChange={() =>
                                        setAnswers((current) => ({
                                          ...current,
                                          [key]: { ...(current[key] ?? {}), [question.id]: option.id },
                                        }))
                                      }
                                    />
                                    {option.text}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => submitExam(program.id, subject.id)}
                            disabled={submittingKey === key}
                            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
                          >
                            {submittingKey === key
                              ? t("student.submitting")
                              : result
                                ? t("student.retakeExam")
                                : t("student.submitExam")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            ) : null}
          </section>
          );
        })
      )}
    </div>
  );
}
