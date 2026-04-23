import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TeacherStudentsClient, { type TeacherStudentRow } from "./TeacherStudentsClient";

export default async function TeacherStudentsPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "INSTRUCTOR") redirect("/login");

  const [enrollments, courseList] = await Promise.all([
    prisma.enrollment.findMany({
      where: { course: { instructorId: user.id } },
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.course.findMany({
      where: { instructorId: user.id },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const rows: TeacherStudentRow[] = enrollments.map((e) => ({
    enrollmentId: e.id,
    enrolledAt: e.enrolledAt.toISOString(),
    progress: e.progress,
    completed: e.completed,
    student: {
      id: e.user.id,
      name: e.user.name,
      email: e.user.email,
      image: e.user.image,
    },
    course: e.course,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <TeacherStudentsClient rows={rows} courses={courseList} />
      </div>
    </div>
  );
}
