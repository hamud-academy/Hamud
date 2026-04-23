import { prisma } from "@/lib/prisma";
import { getLessonIdsWithQuiz } from "@/lib/lesson-quiz-flags";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import CurriculumManager from "@/app/admin/courses/[id]/curriculum/CurriculumManager";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherCurriculumPage({ params }: Props) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user?.role !== "INSTRUCTOR") {
    notFound();
  }

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

  if (!course || course.instructorId !== user.id) notFound();

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
        <Link
          href="/teacher/courses"
          className="px-4 py-2 rounded-lg border-2 border-teal-500 text-teal-600 font-medium hover:bg-teal-50"
        >
          ← Back to My Courses
        </Link>
      </div>
      <CurriculumManager courseId={id} initialModules={modules} />
    </div>
  );
}
