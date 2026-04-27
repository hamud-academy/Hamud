import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";

const schema = z.object({
  courseId: z.string(),
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
  password: z.string().refine(isStrongPassword, strongPasswordMessage()),
});

export async function POST(request: NextRequest) {
  try {
    const orderLimit = checkRateLimit(rateLimitKeyFromRequest(request, "order"), {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!orderLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(orderLimit.retryAfter) },
        }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data. Please fill in all required fields." },
        { status: 400 }
      );
    }

    const { courseId, fullName, email, phone, country, address, region, postcode, paymentMethod, paymentRef, amount, password } = parsed.data;

    const course = await prisma.course.findUnique({
      where: { id: courseId, published: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const order = await prisma.order.create({
      data: {
        courseId,
        fullName,
        email,
        phone: phone || null,
        country: country || null,
        address: address || null,
        region: region || null,
        postcode: postcode || null,
        paymentMethod,
        paymentRef: paymentRef || null,
        amount,
        passwordHash,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("[Orders] ADMIN_EMAIL not set in .env - email not sent.");
    } else {
      const baseUrl = getPublicAppOrigin();
      const result = await sendEmail({
        to: adminEmail,
        subject: `New order (Pending) - ${course.title}`,
        html: `
          <p><strong>New payment order (Pending)</strong></p>
          <p>Name: ${fullName}</p>
          <p>Email: ${email}</p>
          <p>Course: ${course.title}</p>
          <p>Amount: $${Number(amount).toFixed(2)}</p>
          <p>Payment method: ${paymentMethod}${paymentRef ? ` | Reference: ${paymentRef}` : ""}</p>
          ${baseUrl ? `<p><a href="${baseUrl}/admin/requests">View Admin Requests (Dashboard)</a></p>` : ""}
        `,
      });
      if (!result.ok) {
        console.error("[Orders] Resend email failed:", result.error);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (e) {
    console.error("Order create error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
