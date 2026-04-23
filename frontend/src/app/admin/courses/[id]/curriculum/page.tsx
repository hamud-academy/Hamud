import { prisma } from "@/lib/prisma";
import { getLessonIdsWithQuiz } from "@/lib/lesson-quiz-flags";
import { notFound } from "next/navigation";
import Link from "next/link";
import CurriculumManager from "./CurriculumManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CurriculumPage({ params }: Props) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const quizLessonIds = await getLessonIdsWithQuiz(allLessonIds);

  const modules = course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      videoUrl: l.videoUrl,
      documentUrl: l.documentUrl,
      hasQuiz: quizLessonIds.has(l.id),
      duration: l.duration,
      order: l.order,
    })),
  }));

  return (
    <div className="pt-14 lg:pt-8 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Course curriculum</h1>
          <p className="text-gray-600">{course.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/courses/${id}/edit`}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            Edit course
          </Link>
          <Link
            href="/admin/courses"
            className="px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-600 font-medium hover:bg-blue-50"
          >
            ← Back to Courses
          </Link>
        </div>
      </div>

      <CurriculumManager courseId={id} initialModules={modules} />
    </div>
  );
}
