"use client";

import { useState } from "react";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};

export default function DiplomaLessonQuizTake({
  programId,
  subjectId,
  lessonId,
  questions,
}: {
  programId: string;
  subjectId: string;
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    correctCount: number;
    totalQuestions: number;
    percentage: number;
  } | null>(null);

  if (questions.length === 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/dashboard/diploma/lessons/${programId}/${subjectId}/${lessonId}/quiz/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit quiz.");
        return;
      }
      setResult({
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

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Lesson quiz</h2>

      {result ? (
        <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 text-sm text-violet-900">
          Score: {result.percentage}% ({result.correctCount}/{result.totalQuestions} correct)
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">
                {questionIndex + 1}. {question.prompt}
              </p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`lesson-quiz-${question.id}`}
                      checked={answers[question.id] === option.id}
                      onChange={() =>
                        setAnswers((current) => ({ ...current, [question.id]: option.id }))
                      }
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit quiz"}
          </button>
        </form>
      )}
    </div>
  );
}
