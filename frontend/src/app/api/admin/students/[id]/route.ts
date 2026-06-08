import { OrderKind, OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildStudentDiplomaEnrollments } from "@/lib/admin-student-enrollments";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { getDiplomaEnrollments } from "@/lib/diploma-enrollments";
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

  const studentEmail = student.email.trim().toLowerCase();

  const [diplomaEnrollments, diplomaConfig, paidDiplomaOrders, orders] = await Promise.all([
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
    prisma.order.findMany({
      where: {
        OR: [{ userId: student.id }, { email: studentEmail }],
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const programTitleById = new Map(
    diplomaConfig.programs.map((program) => [program.id, program.title])
  );

  const payments = orders.map((order) => ({
    id: order.id,
    kind: order.kind,
    status: order.status,
    amount: Number(order.amount),
    paymentMethod: order.paymentMethod,
    paymentRef: order.paymentRef,
    phone: order.phone,
    itemTitle:
      order.kind === OrderKind.DIPLOMA
        ? order.programTitle ?? "Diploma"
        : order.course?.title ?? "Course",
    itemSubtitle: order.kind === OrderKind.DIPLOMA ? order.planTitle : null,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
  }));

  const paidPayments = payments.filter((p) => p.status === OrderStatus.PAID);
  const pendingPayments = payments.filter((p) => p.status === OrderStatus.PENDING);

  const whatsappPhone =
    orders.map((order) => order.phone?.trim()).find((phone) => phone) ?? null;

  return NextResponse.json({
    id: student.id,
    name: student.name,
    email: student.email,
    createdAt: student.createdAt.toISOString(),
    whatsappPhone,
    enrollments: student.enrollments.map((e) => ({
      id: e.id,
      courseId: e.course.id,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      enrolledAt: e.enrolledAt.toISOString(),
      progress: e.progress,
    })),
    diplomaEnrollments: buildStudentDiplomaEnrollments(
      { id: student.id, email: student.email },
      diplomaEnrollments,
      paidDiplomaOrders,
      programTitleById,
      diplomaConfig
    ),
    payments,
    paymentSummary: {
      totalPaid: paidPayments.reduce((sum, p) => sum + p.amount, 0),
      totalPending: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
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
