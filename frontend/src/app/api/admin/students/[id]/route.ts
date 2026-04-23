import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
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
  const student = await prisma.user.findFirst({
    where: { id, role: "STUDENT" },
    include: {
      enrollments: {
        include: {
          course: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: student.id,
    name: student.name,
    email: student.email,
    createdAt: student.createdAt.toISOString(),
    enrollments: student.enrollments.map((e) => ({
      id: e.id,
      courseId: e.course.id,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      enrolledAt: e.enrolledAt.toISOString(),
      progress: e.progress,
    })),
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
    where: { id, role: "STUDENT" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const data = parsed.data;
  if (data.email && data.email !== existing.email) {
    const taken = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (taken) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.email != null && { email: data.email }),
    },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
  });
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
    where: { id, role: "STUDENT" },
  });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
