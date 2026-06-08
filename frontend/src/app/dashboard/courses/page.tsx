import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardMyCoursesClient from "./DashboardMyCoursesClient";

export default async function MyCoursesPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          category: { select: { name: true } },
          modules: {
            select: {
              _count: { select: { lessons: true } },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const totalLessons = (e: (typeof enrollments)[0]) =>
    e.course.modules.reduce((s, m) => s + m._count.lessons, 0);
  const currentLesson = (e: (typeof enrollments)[0]) => {
    const total = totalLessons(e);
    return total ? Math.floor((e.progress / 100) * total) : 0;
  };

  return (
    <DashboardMyCoursesClient
      enrollments={enrollments.map((e) => ({
        id: e.id,
        progress: e.progress,
        course: {
          title: e.course.title,
          slug: e.course.slug,
          thumbnail: e.course.thumbnail,
          categoryName: e.course.category.name,
        },
        totalLessons: totalLessons(e),
        currentLesson: currentLesson(e),
      }))}
    />
  );
}
