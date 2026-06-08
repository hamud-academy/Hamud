import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  findLessonInSubject,
  getAllLessonsFromSubject,
  getSubjectFromProgram,
  isStudentEnrolledInProgram,
  loadStudentDiplomaProgram,
} from "@/lib/diploma-student-access";
import {
  getCompletedLessonIdsForSubject,
  getSubjectProgress,
  markDiplomaLessonComplete,
} from "@/lib/diploma-lesson-completions";
import { isLessonReleasedForStudent } from "@/lib/diploma-lesson-releases";

export async function POST(
  _request: Request,
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { program } = await loadStudentDiplomaProgram(programId);
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const subject = getSubjectFromProgram(program, subjectId);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  if (!findLessonInSubject(subject, lessonId)) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const released = await isLessonReleasedForStudent(user.id, programId, subjectId, lessonId);
  if (!released) {
    return NextResponse.json({ error: "This lesson has not been released yet." }, { status: 403 });
  }

  await markDiplomaLessonComplete({
    userId: user.id,
    programId,
    subjectId,
    lessonId,
  });

  const allLessons = getAllLessonsFromSubject(subject);
  const completedIds = await getCompletedLessonIdsForSubject(user.id, programId, subjectId);
  const stats = getSubjectProgress(
    allLessons.map((lesson) => lesson.id),
    completedIds
  );

  return NextResponse.json({
    lessonCompleted: true,
    ...stats,
    examUnlocked: stats.curriculumComplete,
  });
}
