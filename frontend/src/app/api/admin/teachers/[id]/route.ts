import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTeacherDiplomaSubjects } from "@/lib/admin-teacher-assignments";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";

const resetPasswordSchema = z.object({
  password: z.string().refine(isStrongPassword, { message: strongPasswordMessage() }),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const [teacher, diplomaConfig] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: "INSTRUCTOR" },
      include: {
        createdCourses: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true,
            _count: { select: { enrollments: true, modules: true } },
          },
          orderBy: { title: "asc" },
        },
      },
    }),
    getDiplomaConfig(),
  ]);

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const diplomaSubjects = getTeacherDiplomaSubjects(diplomaConfig, teacher.id);
  const totalStudents = teacher.createdCourses.reduce(
    (sum: number, course) => sum + course._count.enrollments,
    0
  );

  return NextResponse.json({
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    createdAt: teacher.createdAt.toISOString(),
    courses: teacher.createdCourses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      published: course.published,
      createdAt: course.createdAt.toISOString(),
      moduleCount: course._count.modules,
      studentCount: course._count.enrollments,
    })),
    diplomaSubjects,
    summary: {
      courseCount: teacher.createdCourses.length,
      diplomaSubjectCount: diplomaSubjects.length,
      totalStudents,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.user.findFirst({
    where: { id, role: "INSTRUCTOR" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid password" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.user.findFirst({
    where: { id, role: "INSTRUCTOR" },
    include: { createdCourses: { select: { id: true, title: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
