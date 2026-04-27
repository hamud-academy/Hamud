import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import UniversalVideoPlayer from "@/components/UniversalVideoPlayer";
import LessonQuizTake from "@/components/LessonQuizTake";
import LessonCompleteButton from "@/components/LessonCompleteButton";

interface Props {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function DashboardLessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return null;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: "asc" },
                include: {
                  lessons: { orderBy: { order: "asc" } },
                },
              },
              instructor: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.module.course.slug !== slug || !lesson.module.course.published) {
    notFound();
  }

  const course = lesson.module.course;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: course.id },
    },
  });
  if (!enrollment) {
    notFound();
  }

  const completion = await prisma.lessonCompletion.findUnique({
    where: {
      userId_lessonId: { userId, lessonId },
    },
  });

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 && currentIndex >= 0
      ? allLessons[currentIndex + 1]
      : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link
          href={`/dashboard/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 transition"
        >
          ← {course.title}
        </Link>
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-4">{lesson.title}</h1>

      <div className="mb-6">
        <UniversalVideoPlayer
          videoUrl={lesson.videoUrl}
          posterUrl={course.thumbnail}
          title={lesson.title}
          className="rounded-xl"
        />
      </div>

      {lesson.documentUrl?.trim() && (
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
      )}

      <LessonQuizTake lessonId={lesson.id} variant="dashboard" />

      <LessonCompleteButton
        lessonId={lesson.id}
        initialCompleted={Boolean(completion)}
        initialCourseCompleted={enrollment.completed}
        initialProgress={enrollment.progress}
        certificateUrl={enrollment.completed ? `/api/certificates/${enrollment.id}` : null}
      />

      <div className="flex flex-wrap justify-between gap-3">
        {prevLesson ? (
          <Link
            href={`/dashboard/courses/${slug}/lessons/${prevLesson.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link
            href={`/dashboard/courses/${slug}/lessons/${nextLesson.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition"
          >
            Next →
          </Link>
        ) : (
          <Link
            href={`/dashboard/courses/${slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition"
          >
            Back to course
          </Link>
        )}
      </div>
    </div>
  );
}
