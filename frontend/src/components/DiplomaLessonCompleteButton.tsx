"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DiplomaLessonCompleteButton({
  programId,
  subjectId,
  lessonId,
  initialCompleted,
  subjectProgress,
}: {
  programId: string;
  subjectId: string;
  lessonId: string;
  initialCompleted: boolean;
  subjectProgress: {
    completedCount: number;
    totalLessons: number;
    progress: number;
    curriculumComplete: boolean;
  };
}) {
  const router = useRouter();
  const [lessonCompleted, setLessonCompleted] = useState(initialCompleted);
  const [progress, setProgress] = useState(subjectProgress);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  async function markComplete() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(
        `/api/dashboard/diploma/lessons/${programId}/${subjectId}/${lessonId}/complete`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not mark lesson complete");
        return;
      }
      setLessonCompleted(true);
      setProgress({
        completedCount: data.completedCount,
        totalLessons: data.totalLessons,
        progress: data.progress,
        curriculumComplete: data.curriculumComplete,
      });
      startTransition(() => router.refresh());
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {lessonCompleted ? "Lesson completed" : "Complete this lesson"}
          </p>
          <p className="text-xs text-slate-500">
            Subject progress: {progress.completedCount}/{progress.totalLessons} lessons (
            {progress.progress}%)
            {progress.curriculumComplete ? " · Final exam unlocked" : ""}
          </p>
        </div>
        {!lessonCompleted && (
          <button
            type="button"
            onClick={markComplete}
            disabled={saving || pending}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {saving || pending ? "Saving..." : "Mark lesson complete"}
          </button>
        )}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
