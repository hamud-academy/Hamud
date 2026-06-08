import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { isUserEnrolledInProgram } from "@/lib/diploma-enrollments";
import { getPaidDiplomaProgramIdsForEmail } from "@/lib/diploma-checkout";
import { isDiplomaProgramComplete } from "@/lib/diploma-completion";
import { getStudentDiplomaExamResults, saveDiplomaExamResult } from "@/lib/diploma-exam-results";
import { getAllLessonsFromSubject } from "@/lib/diploma-student-access";
import {
  getCompletedLessonIdsForSubject,
  getStudentDiplomaLessonCompletions,
  getSubjectProgress,
} from "@/lib/diploma-lesson-completions";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string; subjectId: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const { programId, subjectId } = await params;
  const enrolled = await isUserEnrolledInProgram(user.id, programId);
  if (!enrolled) {
    const sessionUser = session?.user as { email?: string } | undefined;
    const paidProgramIds = sessionUser?.email
      ? await getPaidDiplomaProgramIdsForEmail(sessionUser.email)
      : [];
    if (!paidProgramIds.includes(programId)) {
      return NextResponse.json({ error: "You are not enrolled in this diploma program." }, { status: 403 });
    }
  }

  const config = await getDiplomaConfig();
  const program = config.programs.find((item) => item.id === programId && item.status === "PUBLISHED");
  const subject = program?.subjects.find((item) => item.id === subjectId);
  if (!program || !subject) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const questions = subject.exam.questions;
  if (questions.length === 0) {
    return NextResponse.json({ error: "No exam is available for this course yet." }, { status: 404 });
  }

  const allLessons = getAllLessonsFromSubject(subject);
  const lessonIds = allLessons.map((lesson) => lesson.id);
  if (lessonIds.length === 0) {
    return NextResponse.json(
      { error: "Complete all lessons before taking the final exam." },
      { status: 403 }
    );
  }

  const completedLessonIds = await getCompletedLessonIdsForSubject(user.id, programId, subjectId);
  const { curriculumComplete } = getSubjectProgress(lessonIds, completedLessonIds);
  if (!curriculumComplete) {
    return NextResponse.json(
      { error: "Complete all lessons in every module before taking the final exam." },
      { status: 403 }
    );
  }

  let correctCount = 0;
  questions.forEach((question, questionIndex) => {
    const selectedOptionIndex = Number(parsed.data.answers[String(questionIndex)]);
    const correctIndex = question.options.findIndex((option) => option.isCorrect);
    if (Number.isInteger(selectedOptionIndex) && selectedOptionIndex === correctIndex) {
      correctCount += 1;
    }
  });

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const result = await saveDiplomaExamResult({
    userId: user.id,
    programId: program.id,
    programTitle: program.title,
    subjectId: subject.id,
    subjectTitle: subject.title,
    score,
    correctCount,
    totalQuestions,
    passed: score >= subject.exam.passingScore,
    submittedAt: new Date().toISOString(),
  });

  const [allResults, lessonCompletions] = await Promise.all([
    getStudentDiplomaExamResults(user.id),
    getStudentDiplomaLessonCompletions(user.id),
  ]);
  const examBySubject = new Map(
    allResults.filter((r) => r.programId === programId).map((r) => [r.subjectId, r])
  );
  const lessonsBySubject = new Map<string, Set<string>>();
  for (const item of lessonCompletions) {
    if (item.programId !== programId) continue;
    const set = lessonsBySubject.get(item.subjectId) ?? new Set<string>();
    set.add(item.lessonId);
    lessonsBySubject.set(item.subjectId, set);
  }
  const programCompleted = isDiplomaProgramComplete(program, lessonsBySubject, examBySubject);

  return NextResponse.json(
    {
      ...result,
      programCompleted,
      diplomaCertificateUrl: programCompleted ? `/api/certificates/diploma/${programId}` : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
