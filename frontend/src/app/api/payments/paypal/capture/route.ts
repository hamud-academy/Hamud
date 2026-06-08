import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { isPayPalConfigured } from "@/lib/payment-gateway-config";
import { getPayPalAccessToken, paypalApiRequest } from "@/lib/paypal-api";
import {
  updateCourseOrderPaymentRef,
  updateDiplomaOrderPaymentRef,
} from "@/lib/checkout-orders";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(rateLimitKeyFromRequest(request, "paypal-capture"), {
      limit: 15,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
    }

    const { paypalOrderId, orderId, orderType } = (await request.json()) as {
      paypalOrderId?: string;
      orderId?: string;
      orderType?: string;
    };

    if (!paypalOrderId || !orderId) {
      return NextResponse.json({ error: "Missing PayPal order ID or internal order ID." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.paymentRef !== paypalOrderId) {
      return NextResponse.json({ error: "Payment reference mismatch." }, { status: 403 });
    }

    const accessToken = await getPayPalAccessToken();
    const capture = await paypalApiRequest<{
      id: string;
      status?: string;
      purchase_units?: Array<{
        reference_id?: string;
        payments?: { captures?: Array<{ id: string }> };
      }>;
    }>(`/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      accessToken,
      body: JSON.stringify({}),
    });

    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: "PayPal payment was not completed." }, { status: 400 });
    }

    const referenceId = capture.purchase_units?.[0]?.reference_id?.trim();
    if (!referenceId || referenceId !== orderId) {
      return NextResponse.json({ error: "PayPal order reference mismatch." }, { status: 403 });
    }

    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? capture.id ?? paypalOrderId;

    if (orderType === "diploma") {
      await updateDiplomaOrderPaymentRef(orderId, captureId);
    } else {
      await updateCourseOrderPaymentRef(orderId, captureId);
    }

    return NextResponse.json({ success: true, captureId, orderId });
  } catch (error) {
    console.error("PayPal capture error:", error);
    const message = error instanceof Error ? error.message : "Unable to capture PayPal payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
