import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { course: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Order was already approved" },
      { status: 400 }
    );
  }

  let userId = order.userId;
  if (!userId) {
    const existingUser = await prisma.user.findUnique({
      where: { email: order.email },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else if (order.passwordHash) {
      const newUser = await prisma.user.create({
        data: {
          email: order.email,
          name: order.fullName,
          passwordHash: order.passwordHash,
          role: "STUDENT",
        },
      });
      userId = newUser.id;
    } else {
      return NextResponse.json(
        { error: "User could not be created - passwordHash missing" },
        { status: 400 }
      );
    }
  }

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId, courseId: order.courseId },
    },
    create: {
      userId,
      courseId: order.courseId,
    },
    update: {},
  });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      userId,
      paidAt: new Date(),
    },
  });

  const baseUrl = getPublicAppOrigin();
  const courseSlug = order.course.slug ?? order.courseId;
  const emailResult = await sendEmail({
    to: order.email,
    subject: `Your order has been approved - ${order.course.title}`,
    html: `
      <p>Congratulations, ${order.fullName}.</p>
      <p>Your order (${order.course.title}) has been confirmed. You can now access the course using the email and password you used at checkout.</p>
      ${baseUrl ? `<p><a href="${baseUrl}/login">Login</a> | <a href="${baseUrl}/courses/${courseSlug}">View course</a></p>` : ""}
    `,
  });
  if (!emailResult.ok) {
    console.error("[Approve] Resend email to student failed:", emailResult.error);
  }

  return NextResponse.json({ success: true });
}
