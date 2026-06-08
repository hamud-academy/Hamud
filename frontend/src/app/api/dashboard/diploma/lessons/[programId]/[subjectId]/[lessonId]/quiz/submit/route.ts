import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  findLessonInSubject,
  getSubjectFromProgram,
  isStudentEnrolledInProgram,
  loadStudentDiplomaProgram,
} from "@/lib/diploma-student-access";
import { isLessonReleasedForStudent } from "@/lib/diploma-lesson-releases";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string; subjectId: string; lessonId: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { programId, subjectId, lessonId } = await params;
  const enrolled = await isStudentEnrolledInProgram(user.id, user.email, programId);
  if (!enrolled) {
    return NextResponse.json({ error: "Not enrolled in this program" }, { status: 403 });
  }

  const { program } = await loadStudentDiplomaProgram(programId);
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const subject = getSubjectFromProgram(program, subjectId);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const match = findLessonInSubject(subject, lessonId);
  if (!match) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const released = await isLessonReleasedForStudent(user.id, programId, subjectId, lessonId);
  if (!released) {
    return NextResponse.json({ error: "This lesson has not been released yet." }, { status: 403 });
  }

  const questions = match.lesson.quiz?.questions ?? [];
  if (questions.length === 0) {
    return NextResponse.json({ error: "No quiz for this lesson" }, { status: 400 });
  }

  let answers: Record<string, string> = {};
  try {
    const body = await request.json();
    answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let correctCount = 0;
  questions.forEach((question, questionIndex) => {
    const selectedOptionId = answers[String(questionIndex)];
    if (selectedOptionId == null) return;
    const optionIndex = Number.parseInt(String(selectedOptionId), 10);
    if (Number.isNaN(optionIndex)) return;
    if (question.options[optionIndex]?.isCorrect) correctCount += 1;
  });

  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return NextResponse.json({ correctCount, totalQuestions, percentage });
}
