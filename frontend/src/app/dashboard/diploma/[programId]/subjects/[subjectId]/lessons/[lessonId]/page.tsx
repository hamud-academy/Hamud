import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import UniversalVideoPlayer from "@/components/UniversalVideoPlayer";
import DiplomaLessonQuizTake from "@/components/DiplomaLessonQuizTake";
import DiplomaLessonCompleteButton from "@/components/DiplomaLessonCompleteButton";
import {
  findLessonInSubject,
  getAllLessonsFromSubject,
  getSubjectFromProgram,
  isStudentEnrolledInProgram,
  loadStudentDiplomaProgram,
  stripLessonQuizForStudent,
} from "@/lib/diploma-student-access";
import {
  getCompletedLessonIdsForSubject,
  getSubjectProgress,
  isDiplomaLessonCompleted,
} from "@/lib/diploma-lesson-completions";
import { isLessonReleasedForStudent } from "@/lib/diploma-lesson-releases";

interface Props {
  params: Promise<{ programId: string; subjectId: string; lessonId: string }>;
}

export default async function DashboardDiplomaLessonPage({ params }: Props) {
  const { programId, subjectId, lessonId } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) return null;

  const enrolled = await isStudentEnrolledInProgram(user.id, user.email, programId);
  if (!enrolled) notFound();

  const { program } = await loadStudentDiplomaProgram(programId);
  if (!program) notFound();

  const subject = getSubjectFromProgram(program, subjectId);
  if (!subject) notFound();

  const match = findLessonInSubject(subject, lessonId);
  if (!match) notFound();

  const lessonReleased = await isLessonReleasedForStudent(user.id, programId, subjectId, lessonId);
  if (!lessonReleased) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/diploma#subject-${subject.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 transition"
        >
          ← {subject.title}
        </Link>
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <svg className="h-7 w-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Lesson not released yet</h1>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Your instructor will unlock this lesson when you are ready for the next step in your diploma
            program.
          </p>
        </div>
      </div>
    );
  }

  const { lesson, module } = match;
  const allLessons = getAllLessonsFromSubject(subject);
  const currentIndex = allLessons.findIndex((item) => item.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
  const releaseChecks = await Promise.all(
    [prevLesson?.id, nextLesson?.id]
      .filter((id): id is string => Boolean(id))
      .map(async (id) => [id, await isLessonReleasedForStudent(user.id!, programId, subjectId, id)] as const)
  );
  const releasedMap = new Map(releaseChecks);

  const lessonBase = `/dashboard/diploma/${programId}/subjects/${subjectId}/lessons`;
  const quizQuestions = stripLessonQuizForStudent(lesson.quiz?.questions ?? []);
  const [lessonCompleted, completedLessonIds] = await Promise.all([
    isDiplomaLessonCompleted(user.id, programId, subjectId, lessonId),
    getCompletedLessonIdsForSubject(user.id, programId, subjectId),
  ]);
  const subjectProgress = getSubjectProgress(
    allLessons.map((item) => item.id),
    completedLessonIds
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link
          href={`/dashboard/diploma#subject-${subject.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 transition"
        >
          ← {subject.title}
        </Link>
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-violet-600">{subject.code}</p>
      <p className="text-sm text-slate-500 mt-1">{module.title}</p>
      <h1 className="text-xl font-bold text-slate-900 mb-4 mt-1">{lesson.title}</h1>

      {lesson.description ? (
        <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{lesson.description}</p>
      ) : null}

      <div className="mb-6">
        <UniversalVideoPlayer
          videoUrl={lesson.videoUrl || null}
          title={lesson.title}
          className="rounded-xl"
        />
      </div>

      {lesson.documentUrl?.trim() ? (
        <div className="mb-6">
          <a
            href={lesson.documentUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium text-sm hover:bg-slate-50 transition"
          >
            Download lesson document
          </a>
        </div>
      ) : null}

      <DiplomaLessonQuizTake
        programId={programId}
        subjectId={subjectId}
        lessonId={lessonId}
        questions={quizQuestions}
      />

      <DiplomaLessonCompleteButton
        programId={programId}
        subjectId={subjectId}
        lessonId={lessonId}
        initialCompleted={lessonCompleted}
        subjectProgress={subjectProgress}
      />

      <div className="flex flex-wrap justify-between gap-3">
        {prevLesson && releasedMap.get(prevLesson.id) ? (
          <Link
            href={`${lessonBase}/${prevLesson.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {nextLesson && releasedMap.get(nextLesson.id) ? (
          <Link
            href={`${lessonBase}/${nextLesson.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition"
          >
            Next →
          </Link>
        ) : (
          <Link
            href={`/dashboard/diploma#subject-${subject.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition"
          >
            Back to subject
          </Link>
        )}
      </div>
    </div>
  );
}
