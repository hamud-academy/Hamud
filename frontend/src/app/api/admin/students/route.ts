import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const search = searchParams.get("search")?.trim() || undefined;

  const hasEnrollmentFilter = courseId || dateFrom || dateTo;

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(hasEnrollmentFilter && {
        enrollments: {
          some: {
            ...(courseId && { courseId }),
            ...((dateFrom || dateTo) && {
              enrolledAt: {
                ...(dateFrom && { gte: new Date(dateFrom) }),
                ...(dateTo && {
                  lte: (() => {
                    const d = new Date(dateTo);
                    d.setHours(23, 59, 59, 999);
                    return d;
                  })(),
                }),
              },
            }),
          },
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
      enrollments: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const list = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    createdAt: s.createdAt.toISOString(),
    enrollments: s.enrollments.map((e) => ({
      id: e.id,
      courseId: e.course.id,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      enrolledAt: e.enrolledAt.toISOString(),
      progress: e.progress,
    })),
  }));

  return NextResponse.json({ students: list });
}
