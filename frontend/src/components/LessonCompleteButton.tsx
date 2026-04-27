"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type CompletionState = {
  completed: boolean;
  progress: number;
  certificateUrl: string | null;
};

export default function LessonCompleteButton({
  lessonId,
  initialCompleted,
  initialCourseCompleted,
  initialProgress,
  certificateUrl,
}: {
  lessonId: string;
  initialCompleted: boolean;
  initialCourseCompleted: boolean;
  initialProgress: number;
  certificateUrl: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<CompletionState>({
    completed: initialCourseCompleted,
    progress: initialProgress,
    certificateUrl,
  });
  const [lessonCompleted, setLessonCompleted] = useState(initialCompleted);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  async function markComplete() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not mark lesson complete");
        return;
      }
      setLessonCompleted(true);
      setState({
        completed: Boolean(data.completed),
        progress: Number(data.progress ?? 0),
        certificateUrl: data.certificateUrl ?? null,
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
            Course progress: {state.progress}%{state.completed ? " - certificate unlocked" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          {state.certificateUrl && (
            <Link
              href={state.certificateUrl}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Download certificate
            </Link>
          )}
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
