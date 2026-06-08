import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTeacherDiplomaSubjects } from "@/lib/admin-teacher-assignments";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { prisma } from "@/lib/prisma";

function endOfDay(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId") || undefined;
  const programId = searchParams.get("programId") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const search = searchParams.get("search")?.trim() || undefined;

  const [teachers, diplomaConfig] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        ...(courseId && {
          createdCourses: { some: { id: courseId } },
        }),
        ...((dateFrom || dateTo) && {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: endOfDay(dateTo) }),
          },
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        createdCourses: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            _count: { select: { enrollments: true } },
          },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getDiplomaConfig(),
  ]);

  let list = teachers.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    createdAt: teacher.createdAt.toISOString(),
    courses: teacher.createdCourses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      published: course.published,
      studentCount: course._count.enrollments,
    })),
    diplomaSubjects: getTeacherDiplomaSubjects(diplomaConfig, teacher.id),
  }));

  if (programId) {
    list = list.filter((teacher) =>
      teacher.diplomaSubjects.some((subject) => subject.programId === programId)
    );
  }

  return NextResponse.json({ teachers: list });
}
