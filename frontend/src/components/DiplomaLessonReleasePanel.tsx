"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type EnrolledStudent = {
  userId: string;
  name: string | null;
  email: string;
  enrolledAt: string;
  planType: string;
};

type LessonReleaseRow = {
  lessonId: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  order: number;
  released: boolean;
  releasedAt: string | null;
};

type ReleaseState = {
  guidedMode: boolean;
  releasedCount: number;
  totalLessons: number;
  lessons: LessonReleaseRow[];
};

type SubjectOption = {
  id: string;
  title: string;
  code: string;
};

type DiplomaLessonReleasePanelProps = {
  mode: "admin" | "teacher";
  programId: string;
  programTitle: string;
  subjects: SubjectOption[];
  fixedSubjectId?: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DiplomaLessonReleasePanel({
  mode,
  programId,
  programTitle,
  subjects,
  fixedSubjectId,
}: DiplomaLessonReleasePanelProps) {
  const [subjectId, setSubjectId] = useState(fixedSubjectId ?? subjects[0]?.id ?? "");
  const [userId, setUserId] = useState("");
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [state, setState] = useState<ReleaseState | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const activeSubject = useMemo(
    () => subjects.find((item) => item.id === subjectId) ?? subjects[0],
    [subjectId, subjects]
  );

  const apiUrl = useMemo(() => {
    if (mode === "admin") return "/api/admin/diploma-lesson-releases";
    return `/api/teacher/diploma/subjects/${encodeURIComponent(subjectId)}/lesson-releases`;
  }, [mode, subjectId]);

  const loadData = useCallback(async () => {
    if (!programId || !subjectId) return;
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ programId, subjectId });
      if (userId) params.set("userId", userId);
      const res = await fetch(`${apiUrl}?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to load release data." });
        return;
      }
      setStudents(data.students ?? []);
      setState(data.state ?? null);
    } catch {
      setMessage({ type: "err", text: "Connection error while loading release data." });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, programId, subjectId, userId]);

  useEffect(() => {
    if (fixedSubjectId) setSubjectId(fixedSubjectId);
  }, [fixedSubjectId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function runAction(
    action: string,
    extra?: { lessonId?: string; moduleId?: string }
  ) {
    if (!userId || !subjectId) {
      setMessage({ type: "err", text: "Select a student first." });
      return;
    }

    setActing(true);
    setMessage(null);
    try {
      const body: Record<string, string> = {
        action,
        programId,
        userId,
      };
      if (mode === "admin") body.subjectId = subjectId;
      if (extra?.lessonId) body.lessonId = extra.lessonId;
      if (extra?.moduleId) body.moduleId = extra.moduleId;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Action failed." });
        return;
      }
      setState(data.state ?? null);
      setMessage({ type: "ok", text: "Student lesson access updated." });
    } catch {
      setMessage({ type: "err", text: "Connection error while updating access." });
    } finally {
      setActing(false);
    }
  }

  const moduleGroups = useMemo(() => {
    if (!state) return [];
    const groups = new Map<string, { moduleTitle: string; lessons: LessonReleaseRow[] }>();
    for (const lesson of state.lessons) {
      const existing = groups.get(lesson.moduleId);
      if (existing) {
        existing.lessons.push(lesson);
      } else {
        groups.set(lesson.moduleId, { moduleTitle: lesson.moduleTitle, lessons: [lesson] });
      }
    }
    return Array.from(groups.entries()).map(([moduleId, value]) => ({
      moduleId,
      moduleTitle: value.moduleTitle,
      lessons: value.lessons,
    }));
  }, [state]);

  const selectedStudent = students.find((item) => item.userId === userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Guided Learning</p>
        <h2 className="mt-1 text-xl font-extrabold text-slate-950">Lesson Release</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Release diploma lessons to students step by step so they follow the planned pace. When guided
          learning is off, all lessons stay open. When enabled, only released lessons are visible to the
          student.
        </p>
      </div>

      {message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {!fixedSubjectId ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Subject
            </span>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setUserId("");
                setState(null);
              }}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.title} ({subject.code})
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{activeSubject?.title}</p>
          </div>
        )}

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Enrolled student
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading || students.length === 0}
          >
            <option value="">
              {students.length === 0 ? "No enrolled students" : "Select a student"}
            </option>
            {students.map((student) => (
              <option key={student.userId} value={student.userId}>
                {student.name ?? student.email} · {student.email}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50/80 via-white to-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">{programTitle}</p>
            <p className="mt-1 text-xs text-slate-500">
              {activeSubject?.title ?? "Subject"} · {students.length} enrolled students
            </p>
            {selectedStudent ? (
              <p className="mt-2 text-xs font-medium text-violet-700">
                Managing access for {selectedStudent.name ?? selectedStudent.email}
              </p>
            ) : null}
          </div>

          {state ? (
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  state.guidedMode
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {state.guidedMode ? "Guided mode" : "Open access"}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                {state.releasedCount}/{state.totalLessons} released
              </span>
            </div>
          ) : null}
        </div>

        {userId && state ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {!state.guidedMode ? (
              <button
                type="button"
                disabled={acting || state.totalLessons === 0}
                onClick={() => runAction("enable_guided")}
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                Enable guided learning
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => runAction("release_next")}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  Release next lesson
                </button>
                <button
                  type="button"
                  disabled={acting || state.releasedCount >= state.totalLessons}
                  onClick={() => runAction("release_all")}
                  className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
                >
                  Release all lessons
                </button>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => runAction("disable_guided")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Disable guided learning
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Loading lesson release data...
        </div>
      ) : !userId ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Select an enrolled student to manage lesson releases.
        </div>
      ) : !state || state.totalLessons === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          No lessons in this subject yet. Add curriculum under Teacher → Diploma first.
        </div>
      ) : (
        <div className="space-y-4">
          {moduleGroups.map((module, moduleIndex) => (
            <div key={module.moduleId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Module {moduleIndex + 1}
                  </p>
                  <p className="text-sm font-bold text-slate-900">{module.moduleTitle}</p>
                </div>
                {state.guidedMode ? (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => runAction("release_module", { moduleId: module.moduleId })}
                    className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
                  >
                    Release module
                  </button>
                ) : null}
              </div>

              <ul className="divide-y divide-slate-100">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.lessonId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        lesson.released
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {lesson.released ? "✓" : lessonIndex + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.released
                          ? lesson.releasedAt
                            ? `Released ${formatDate(lesson.releasedAt)}`
                            : "Released"
                          : state.guidedMode
                            ? "Locked for student"
                            : "Open to student"}
                      </p>
                    </div>

                    {state.guidedMode ? (
                      lesson.released ? (
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => runAction("revoke_lesson", { lessonId: lesson.lessonId })}
                          className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => runAction("release_lesson", { lessonId: lesson.lessonId })}
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
                        >
                          Release
                        </button>
                      )
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Open
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
