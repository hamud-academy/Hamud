import { OrderKind, OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildStudentDiplomaEnrollments } from "@/lib/admin-student-enrollments";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { getDiplomaEnrollments } from "@/lib/diploma-enrollments";
import { prisma } from "@/lib/prisma";

function endOfDay(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date;
}

function inDateRange(iso: string, dateFrom?: string, dateTo?: string) {
  const date = new Date(iso);
  if (dateFrom && date < new Date(dateFrom)) return false;
  if (dateTo && date > endOfDay(dateTo)) return false;
  return true;
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

  const [students, diplomaEnrollments, diplomaConfig, paidDiplomaOrders] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(courseId && {
          enrollments: {
            some: {
              courseId,
              ...((dateFrom || dateTo) && {
                enrolledAt: {
                  ...(dateFrom && { gte: new Date(dateFrom) }),
                  ...(dateTo && { lte: endOfDay(dateTo) }),
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
    }),
    getDiplomaEnrollments(),
    getDiplomaConfig(),
    prisma.order.findMany({
      where: { kind: OrderKind.DIPLOMA, status: OrderStatus.PAID },
      select: {
        id: true,
        userId: true,
        email: true,
        programId: true,
        programTitle: true,
        programSlug: true,
        planType: true,
        planTitle: true,
        paidAt: true,
        createdAt: true,
      },
    }),
  ]);

  const programTitleById = new Map(
    diplomaConfig.programs.map((program) => [program.id, program.title])
  );

  let list = students.map((s) => ({
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
    diplomaEnrollments: buildStudentDiplomaEnrollments(
      { id: s.id, email: s.email },
      diplomaEnrollments,
      paidDiplomaOrders,
      programTitleById,
      diplomaConfig
    ),
  }));

  if (programId) {
    list = list.filter((student) =>
      student.diplomaEnrollments.some(
        (enrollment) =>
          enrollment.programId === programId &&
          (!(dateFrom || dateTo) || inDateRange(enrollment.enrolledAt, dateFrom, dateTo))
      )
    );
  }

  if (!courseId && !programId && (dateFrom || dateTo)) {
    list = list.filter(
      (student) =>
        student.enrollments.some((enrollment) =>
          inDateRange(enrollment.enrolledAt, dateFrom, dateTo)
        ) ||
        student.diplomaEnrollments.some((enrollment) =>
          inDateRange(enrollment.enrolledAt, dateFrom, dateTo)
        )
    );
  }

  return NextResponse.json({ students: list });
}
