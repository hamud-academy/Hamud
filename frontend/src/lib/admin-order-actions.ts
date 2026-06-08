import { prisma } from "@/lib/prisma";
import { enrollUserInDiplomaProgram } from "@/lib/diploma-enrollments";
import { sendEmail } from "@/lib/resend";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";

export async function approveOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { course: true },
  });

  if (!order) {
    return { ok: false as const, status: 404, error: "Order not found" };
  }

  if (order.status !== "PENDING") {
    return { ok: false as const, status: 400, error: "Order was already approved" };
  }

  const studentEmail = order.email.trim().toLowerCase();
  let userId = order.userId;

  if (!userId) {
    const existingUser = await prisma.user.findUnique({
      where: { email: studentEmail },
    });
    if (existingUser) {
      userId = existingUser.id;
    } else if (order.passwordHash) {
      const newUser = await prisma.user.create({
        data: {
          email: studentEmail,
          name: order.fullName,
          passwordHash: order.passwordHash,
          role: "STUDENT",
        },
      });
      userId = newUser.id;
    } else {
      return {
        ok: false as const,
        status: 400,
        error: "User could not be created - passwordHash missing",
      };
    }
  }

  const baseUrl = getPublicAppOrigin();

  if (order.kind === "DIPLOMA") {
    if (!order.programId || !order.programSlug || !order.planType) {
      return { ok: false as const, status: 400, error: "Invalid diploma order" };
    }

    await enrollUserInDiplomaProgram({
      userId,
      programId: order.programId,
      programSlug: order.programSlug,
      planType: order.planType,
      orderId: order.id,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", userId, paidAt: new Date(), passwordHash: null },
    });

    const emailResult = await sendEmail({
      to: studentEmail,
      subject: `Your diploma order has been approved - ${order.programTitle ?? "Diploma"}`,
      html: `
        <p>Congratulations, ${order.fullName}.</p>
        <p>Your diploma order (${order.programTitle ?? "Diploma"}${order.planTitle ? ` - ${order.planTitle}` : ""}) has been confirmed. You can now access your diploma dashboard using the email and password you used at checkout.</p>
        ${baseUrl ? `<p><a href="${baseUrl}/login">Login</a> | <a href="${baseUrl}/dashboard/diploma">Open diploma dashboard</a></p>` : ""}
      `,
    });
    if (!emailResult.ok) {
      console.error("[Approve diploma] Email to student failed:", emailResult.error);
    }

    return { ok: true as const, userId };
  }

  if (!order.courseId || !order.course) {
    return { ok: false as const, status: 400, error: "Invalid course order" };
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: order.courseId } },
    create: { userId, courseId: order.courseId },
    update: {},
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID", userId, paidAt: new Date(), passwordHash: null },
  });

  const courseSlug = order.course.slug ?? order.courseId;
  const emailResult = await sendEmail({
    to: studentEmail,
    subject: `Your order has been approved - ${order.course.title}`,
    html: `
      <p>Congratulations, ${order.fullName}.</p>
      <p>Your order (${order.course.title}) has been confirmed. You can now access the course using the email and password you used at checkout.</p>
      ${baseUrl ? `<p><a href="${baseUrl}/login">Login</a> | <a href="${baseUrl}/courses/${courseSlug}">View course</a></p>` : ""}
    `,
  });
  if (!emailResult.ok) {
    console.error("[Approve] Email to student failed:", emailResult.error);
  }

  return { ok: true as const, userId };
}

export async function denyOrderById(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { ok: false as const, status: 404, error: "Order not found" };
  }

  if (order.status !== "PENDING") {
    return {
      ok: false as const,
      status: 400,
      error: "This order was already approved or denied",
    };
  }

  await prisma.order.delete({ where: { id: orderId } });
  return { ok: true as const };
}
