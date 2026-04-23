import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherDashboardClient from "./TeacherDashboardClient";

export default async function TeacherDashboardPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user?.role !== "INSTRUCTOR") redirect("/login");

  const instructorId = user.id;

  const [courses, revenueResult, enrollments, ordersByMonth, enrollmentsByCourse] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.aggregate({
      where: {
        status: "PAID",
        course: { instructorId },
      },
      _sum: { amount: true },
    }),
    prisma.enrollment.findMany({
      where: { course: { instructorId } },
      select: { id: true, progress: true, courseId: true, userId: true },
    }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        course: { instructorId },
      },
      select: { amount: true, paidAt: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: { course: { instructorId } },
      _count: { id: true },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.amount ?? 0);
  const uniqueStudents = new Set(enrollments.map((e) => e.userId)).size;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
      : 0;

  const courseIds = courses.map((c) => c.id);
  const courseIdToTitle: Record<string, string> = {};
  courses.forEach((c) => {
    courseIdToTitle[c.id] = c.title;
  });

  const revenueByMonth: { month: string; revenue: number }[] = [];
  const monthMap: Record<string, number> = {};
  for (const o of ordersByMonth) {
    const d = o.paidAt ?? o.createdAt;
    const key = d ? new Date(d).toISOString().slice(0, 7) : "";
    if (!key) continue;
    monthMap[key] = (monthMap[key] ?? 0) + Number(o.amount);
  }
  Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([month, revenue]) => {
      revenueByMonth.push({ month, revenue });
    });

  const studentsPerCourse = courseIds.map((courseId) => {
    const count = enrollmentsByCourse.find((x) => x.courseId === courseId)?._count.id ?? 0;
    return { courseId, title: courseIdToTitle[courseId] ?? "Course", students: count };
  });

  const progressData = enrollments.map((e) => ({
    progress: e.progress,
    courseId: e.courseId,
  }));
  const progressByCourse = courseIds.map((courseId) => {
    const list = progressData.filter((p) => p.courseId === courseId);
    const avg = list.length ? Math.round(list.reduce((s, p) => s + p.progress, 0) / list.length) : 0;
    return { courseId, title: courseIdToTitle[courseId] ?? "Course", avgProgress: avg, enrollments: list.length };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <TeacherDashboardClient
          totalRevenue={totalRevenue}
          totalStudents={uniqueStudents}
          coursesCount={courses.length}
          avgProgress={avgProgress}
          revenueByMonth={revenueByMonth}
          studentsPerCourse={studentsPerCourse}
          progressByCourse={progressByCourse}
        />
      </div>
    </div>
  );
}
