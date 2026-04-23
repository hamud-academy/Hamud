import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import UniversalVideoPlayer from "@/components/UniversalVideoPlayer";
import LessonQuizTake from "@/components/LessonQuizTake";

interface Props {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;

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

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });
    isEnrolled = !!enrollment;
  }

  if (!isEnrolled) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-14 sm:pt-16 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold text-gray-900">Enroll in course</h1>
            <p className="text-gray-600 mt-2">To view this lesson, you need to enroll in the course.</p>
            <Link
              href={`/courses/${slug}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go to course
            </Link>
          </div>
        </main>
      </>
    );
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 && currentIndex >= 0
    ? allLessons[currentIndex + 1]
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={`/courses/${slug}`}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              ← {course.title}
            </Link>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-4">{lesson.title}</h1>

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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-800 font-medium hover:bg-gray-50"
              >
                Download lesson document
              </a>
            </div>
          )}

          <LessonQuizTake lessonId={lesson.id} />

          <div className="flex justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${slug}/lessons/${prevLesson.id}`}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                ← Previous lesson
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link
                href={`/courses/${slug}/lessons/${nextLesson.id}`}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Next →
              </Link>
            ) : (
              <Link
                href={`/courses/${slug}`}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Back to course
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
