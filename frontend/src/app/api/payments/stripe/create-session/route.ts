import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { getPublicAppOrigin } from "@/lib/resolve-media-url";
import { isStripeConfigured } from "@/lib/payment-gateway-config";
import { getStripeClient } from "@/lib/stripe-client";
import {
  createCourseCheckoutOrder,
  createDiplomaCheckoutOrder,
  parseCourseCheckoutBody,
  parseDiplomaCheckoutBody,
  updateCourseOrderPaymentRef,
  updateDiplomaOrderPaymentRef,
} from "@/lib/checkout-orders";

function buildSuccessQuery(order: { type: "course" | "diploma"; orderId: string }, extra?: Record<string, string>) {
  const params = new URLSearchParams(extra ?? {});
  params.set("paid", "1");
  if (order.type === "course") {
    params.set("order", order.orderId);
  } else {
    params.set("diplomaOrder", order.orderId);
  }
  return params.toString();
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Card payments are not configured. Add Stripe keys to .env." },
        { status: 503 }
      );
    }

    const rateLimit = checkRateLimit(rateLimitKeyFromRequest(request, "stripe-session"), {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const body = await request.json();
    const orderType = body.orderType === "diploma" ? "diploma" : "course";
    const paymentMethod = "Stripe";
    const baseUrl = getPublicAppOrigin() ?? request.nextUrl.origin;

    if (orderType === "diploma") {
      const parsed = await parseDiplomaCheckoutBody(body);
      if (!parsed.ok) {
        return NextResponse.json(
          { error: "Invalid data. Please fill in all required fields." },
          { status: 400 }
        );
      }

      const order = await createDiplomaCheckoutOrder({ ...parsed.data, paymentMethod });
      const successExtra = {
        diploma: parsed.data.programSlug,
        plan: parsed.data.planType,
      };
      const cancelUrl = `${baseUrl}/checkout/diploma/${encodeURIComponent(parsed.data.programSlug)}?plan=${encodeURIComponent(parsed.data.planType)}`;

      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: order.title },
              unit_amount: Math.round(order.amount * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: parsed.data.email.trim().toLowerCase(),
        metadata: {
          orderId: order.orderId,
          orderType: order.type,
        },
        success_url: `${baseUrl}/checkout/success?${buildSuccessQuery(order, successExtra)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
      });

      if (session.id) {
        await updateDiplomaOrderPaymentRef(order.orderId, session.id);
      }

      if (!session.url) {
        return NextResponse.json({ error: "Unable to start card checkout." }, { status: 500 });
      }

      return NextResponse.json({ url: session.url });
    }

    const parsed = await parseCourseCheckoutBody(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Invalid data. Please fill in all required fields." },
        { status: 400 }
      );
    }

    const order = await createCourseCheckoutOrder({ ...parsed.data, paymentMethod });
    const { prisma } = await import("@/lib/prisma");
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { slug: true },
    });
    const successExtra: Record<string, string> = {};
    if (course?.slug) successExtra.slug = course.slug;

    const cancelUrl = `${baseUrl}/checkout/${course?.slug ?? ""}`;

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: order.title },
            unit_amount: Math.round(order.amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: parsed.data.email.trim().toLowerCase(),
      metadata: {
        orderId: order.orderId,
        orderType: order.type,
      },
      success_url: `${baseUrl}/checkout/success?${buildSuccessQuery(order, successExtra)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    if (session.id) {
      await updateCourseOrderPaymentRef(order.orderId, session.id);
    }

    if (!session.url) {
      return NextResponse.json({ error: "Unable to start card checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
