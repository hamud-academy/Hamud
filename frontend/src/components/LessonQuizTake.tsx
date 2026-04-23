"use client";

import { useEffect, useState } from "react";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};

export default function LessonQuizTake({
  lessonId,
  variant = "public",
}: {
  lessonId: string;
  variant?: "public" | "dashboard";
}) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{
    correctCount: number;
    totalQuestions: number;
    percentage: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isDash = variant === "dashboard";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/quiz`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setQuiz(null);
          setLoading(false);
          return;
        }
        setQuiz(data.quiz ?? null);
      } catch {
        setQuiz(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quiz) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit");
        return;
      }
      setSubmitted({
        correctCount: data.correctCount,
        totalQuestions: data.totalQuestions,
        percentage: data.percentage,
      });
    } catch {
      setError("Connection error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !quiz) return null;

  if (submitted) {
    return (
      <div
        className={
          isDash
            ? "mt-8 p-6 rounded-xl border border-slate-200 bg-white shadow-sm"
            : "mt-8 p-6 rounded-xl border-2 border-gray-200 bg-white"
        }
      >
        <h2
          className={
            isDash
              ? "text-lg font-semibold text-slate-900 mb-2"
              : "text-lg font-semibold text-gray-900 mb-2"
          }
        >
          Quiz results
        </h2>
        <p className={isDash ? "text-slate-700" : "text-gray-700"}>
          Correct answers: <strong>{submitted.correctCount}</strong> /{" "}
          {submitted.totalQuestions}
        </p>
        <p className={isDash ? "text-slate-700 mt-1" : "text-gray-700 mt-1"}>
          Score: <strong>{submitted.percentage}%</strong>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isDash
          ? "mt-8 p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-6"
          : "mt-8 p-6 rounded-xl border-2 border-gray-200 bg-white space-y-6"
      }
    >
      <h2
        className={
          isDash
            ? "text-lg font-semibold text-slate-900"
            : "text-lg font-semibold text-gray-900"
        }
      >
        Lesson quiz
      </h2>
      {quiz.questions.map((q, qi) => (
        <div key={q.id}>
          <p
            className={
              isDash
                ? "font-medium text-slate-900 mb-2"
                : "font-medium text-gray-900 mb-2"
            }
          >
            {qi + 1}. {q.prompt}
          </p>
          <div className="space-y-2 pl-1">
            {q.options.map((o) => (
              <label
                key={o.id}
                className={
                  isDash
                    ? "flex items-center gap-2 cursor-pointer text-sm text-slate-700"
                    : "flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                }
              >
                <input
                  type="radio"
                  name={q.id}
                  required
                  checked={answers[q.id] === o.id}
                  onChange={() =>
                    setAnswers((a) => ({ ...a, [q.id]: o.id }))
                  }
                  className={isDash ? "accent-violet-600" : undefined}
                />
                <span>{o.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className={
          isDash
            ? "px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50 transition"
            : "px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
        }
      >
        {submitting ? "Submitting..." : "Submit quiz"}
      </button>
    </form>
  );
}
