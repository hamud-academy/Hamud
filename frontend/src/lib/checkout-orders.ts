import "server-only";

import { prisma } from "@/lib/prisma";
import { notifyAdminByEmail } from "@/lib/resend";
import { getDiplomaCheckoutContext, saveDiplomaOrder } from "@/lib/diploma-checkout";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";
import { resolveCheckoutCredentials } from "@/lib/checkout-auth";
import { getLoggedInCheckoutCustomer } from "@/lib/checkout-customer";
import { z } from "zod";

const billingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  paymentMethod: z.string().min(1),
  paymentRef: z.string().optional(),
  amount: z.number().min(0),
  password: z.string().optional(),
});

export const courseCheckoutSchema = billingSchema.extend({
  courseId: z.string(),
});

export const diplomaCheckoutSchema = billingSchema.extend({
  programId: z.string().min(1),
  programSlug: z.string().min(1),
  planType: z.enum(["SLOW", "SPEEDY", "EXPRESS", "ONE_TIME"]),
});

const studentCourseCheckoutSchema = z.object({
  studentCheckout: z.literal(true),
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  paymentMethod: z.string().min(1),
  paymentRef: z.string().optional(),
  amount: z.number().min(0),
});

const studentDiplomaCheckoutSchema = z.object({
  studentCheckout: z.literal(true),
  studentId: z.string().min(1),
  programId: z.string().min(1),
  programSlug: z.string().min(1),
  planType: z.enum(["SLOW", "SPEEDY", "EXPRESS", "ONE_TIME"]),
  paymentMethod: z.string().min(1),
  paymentRef: z.string().optional(),
  amount: z.number().min(0),
});

export type CourseCheckoutInput = z.infer<typeof courseCheckoutSchema>;
export type DiplomaCheckoutInput = z.infer<typeof diplomaCheckoutSchema>;

function buildStudentCourseInput(
  customer: NonNullable<Awaited<ReturnType<typeof getLoggedInCheckoutCustomer>>>,
  data: z.infer<typeof studentCourseCheckoutSchema>
): CourseCheckoutInput {
  const { studentCheckout: _studentCheckout, studentId: _studentId, ...orderFields } = data;
  return {
    ...orderFields,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    country: customer.country,
    address: customer.address,
    region: customer.region,
    postcode: customer.postcode,
  };
}

function buildStudentDiplomaInput(
  customer: NonNullable<Awaited<ReturnType<typeof getLoggedInCheckoutCustomer>>>,
  data: z.infer<typeof studentDiplomaCheckoutSchema>
): DiplomaCheckoutInput {
  const { studentCheckout: _studentCheckout, studentId: _studentId, ...orderFields } = data;
  return {
    ...orderFields,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    country: customer.country,
    address: customer.address,
    region: customer.region,
    postcode: customer.postcode,
  };
}

function wantsStudentSectionCheckout(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { studentCheckout?: unknown }).studentCheckout === true
  );
}

export async function parseCourseCheckoutBody(
  body: unknown
): Promise<{ ok: true; data: CourseCheckoutInput } | { ok: false }> {
  if (wantsStudentSectionCheckout(body)) {
    const customer = await getLoggedInCheckoutCustomer();
    if (!customer) return { ok: false };

    const studentParsed = studentCourseCheckoutSchema.safeParse(body);
    if (!studentParsed.success) return { ok: false };
    if (studentParsed.data.studentId !== customer.userId) return { ok: false };
    return { ok: true, data: buildStudentCourseInput(customer, studentParsed.data) };
  }

  const guestParsed = courseCheckoutSchema.safeParse(body);
  if (!guestParsed.success) return { ok: false };
  return { ok: true, data: guestParsed.data };
}

export async function parseDiplomaCheckoutBody(
  body: unknown
): Promise<{ ok: true; data: DiplomaCheckoutInput } | { ok: false }> {
  if (wantsStudentSectionCheckout(body)) {
    const customer = await getLoggedInCheckoutCustomer();
    if (!customer) return { ok: false };

    const studentParsed = studentDiplomaCheckoutSchema.safeParse(body);
    if (!studentParsed.success) return { ok: false };
    if (studentParsed.data.studentId !== customer.userId) return { ok: false };
    return { ok: true, data: buildStudentDiplomaInput(customer, studentParsed.data) };
  }

  const guestParsed = diplomaCheckoutSchema.safeParse(body);
  if (!guestParsed.success) return { ok: false };
  return { ok: true, data: guestParsed.data };
}

export type CheckoutOrderResult =
  | { type: "course"; orderId: string; title: string; amount: number }
  | { type: "diploma"; orderId: string; title: string; amount: number };

async function notifyCourseOrder(
  fullName: string,
  email: string,
  courseTitle: string,
  amount: number,
  paymentMethod: string,
  paymentRef?: string | null
) {
  const baseUrl = getPublicAppOrigin();
  await notifyAdminByEmail({
    subject: `[Hamud-Academy] New course order - ${courseTitle}`,
    html: `
      <p><strong>New payment order (Pending)</strong></p>
      <p>Name: ${fullName}</p>
      <p>Email: ${email}</p>
      <p>Course: ${courseTitle}</p>
      <p>Amount: $${Number(amount).toFixed(2)}</p>
      <p>Payment method: ${paymentMethod}${paymentRef ? ` | Reference: ${paymentRef}` : ""}</p>
      ${baseUrl ? `<p><a href="${baseUrl}/admin/requests">Open Admin Requests</a></p>` : ""}
    `,
  });
}

async function notifyDiplomaOrder(
  fullName: string,
  email: string,
  programTitle: string,
  planTitle: string,
  amount: number,
  paymentMethod: string,
  paymentRef?: string | null
) {
  const baseUrl = getPublicAppOrigin();
  await notifyAdminByEmail({
    subject: `[Hamud-Academy] New diploma order - ${programTitle}`,
    html: `
      <p><strong>New diploma payment order (Pending)</strong></p>
      <p>Name: ${fullName}</p>
      <p>Email: ${email}</p>
      <p>Program: ${programTitle}</p>
      <p>Plan: ${planTitle}</p>
      <p>Amount: $${Number(amount).toFixed(2)}</p>
      <p>Payment method: ${paymentMethod}${paymentRef ? ` | Reference: ${paymentRef}` : ""}</p>
      ${baseUrl ? `<p><a href="${baseUrl}/admin/requests">Open Admin Requests</a></p>` : ""}
    `,
  });
}

export async function createCourseCheckoutOrder(
  input: CourseCheckoutInput
): Promise<CheckoutOrderResult> {
  const email = input.email.trim().toLowerCase();
  const course = await prisma.course.findUnique({
    where: { id: input.courseId, published: true },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const { userId, passwordHash } = await resolveCheckoutCredentials(email, input.password);
  const order = await prisma.order.create({
    data: {
      courseId: input.courseId,
      fullName: input.fullName,
      email,
      phone: input.phone || null,
      country: input.country || null,
      address: input.address || null,
      region: input.region || null,
      postcode: input.postcode || null,
      paymentMethod: input.paymentMethod,
      paymentRef: input.paymentRef || null,
      amount: Number(course.price),
      passwordHash,
      userId,
    },
  });

  await notifyCourseOrder(
    input.fullName,
    email,
    course.title,
    Number(course.price),
    input.paymentMethod,
    input.paymentRef
  );

  return {
    type: "course",
    orderId: order.id,
    title: course.title,
    amount: Number(course.price),
  };
}

export async function createDiplomaCheckoutOrder(
  input: DiplomaCheckoutInput
): Promise<CheckoutOrderResult> {
  const checkout = await getDiplomaCheckoutContext(input.programSlug, input.planType);
  if (!checkout || checkout.program.id !== input.programId) {
    throw new Error("Diploma program not found.");
  }

  const email = input.email.trim().toLowerCase();
  const { userId, passwordHash } = await resolveCheckoutCredentials(email, input.password);
  const order = await saveDiplomaOrder({
    id: `diploma-order-${Date.now()}`,
    programId: checkout.program.id,
    programSlug: checkout.program.slug,
    programTitle: checkout.program.title,
    planType: checkout.plan.type,
    planTitle: checkout.plan.title,
    fullName: input.fullName,
    email,
    phone: input.phone || null,
    country: input.country || null,
    address: input.address || null,
    region: input.region || null,
    postcode: input.postcode || null,
    paymentMethod: input.paymentMethod,
    paymentRef: input.paymentRef || null,
    amount: checkout.amount,
    passwordHash,
    userId,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });

  await notifyDiplomaOrder(
    input.fullName,
    email,
    checkout.program.title,
    checkout.plan.title,
    checkout.amount,
    input.paymentMethod,
    input.paymentRef
  );

  return {
    type: "diploma",
    orderId: order.id,
    title: `${checkout.program.title} - ${checkout.plan.title}`,
    amount: checkout.amount,
  };
}

export async function updateCourseOrderPaymentRef(orderId: string, paymentRef: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentRef },
  });
}

export async function updateDiplomaOrderPaymentRef(orderId: string, paymentRef: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentRef },
  });
}
