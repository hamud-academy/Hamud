import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { isPayPalConfigured } from "@/lib/payment-gateway-config";
import { getPayPalAccessToken, paypalApiRequest } from "@/lib/paypal-api";
import {
  createCourseCheckoutOrder,
  createDiplomaCheckoutOrder,
  parseCourseCheckoutBody,
  parseDiplomaCheckoutBody,
  updateCourseOrderPaymentRef,
  updateDiplomaOrderPaymentRef,
} from "@/lib/checkout-orders";

export async function POST(request: NextRequest) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: "PayPal is not configured." }, { status: 503 });
    }

    const rateLimit = checkRateLimit(rateLimitKeyFromRequest(request, "paypal-create"), {
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

    if (orderType === "diploma") {
      const parsed = await parseDiplomaCheckoutBody(body);
      if (!parsed.ok) {
        return NextResponse.json(
          { error: "Invalid data. Please fill in all required fields." },
          { status: 400 }
        );
      }

      const order = await createDiplomaCheckoutOrder({ ...parsed.data, paymentMethod: "PayPal" });
      const accessToken = await getPayPalAccessToken();
      const paypalOrder = await paypalApiRequest<{ id: string }>("/v2/checkout/orders", {
        method: "POST",
        accessToken,
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: order.orderId,
              description: order.title,
              amount: {
                currency_code: "USD",
                value: order.amount.toFixed(2),
              },
            },
          ],
        }),
      });

      await updateDiplomaOrderPaymentRef(order.orderId, paypalOrder.id);
      return NextResponse.json({ paypalOrderId: paypalOrder.id, orderId: order.orderId });
    }

    const parsed = await parseCourseCheckoutBody(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Invalid data. Please fill in all required fields." },
        { status: 400 }
      );
    }

    const order = await createCourseCheckoutOrder({ ...parsed.data, paymentMethod: "PayPal" });
    const accessToken = await getPayPalAccessToken();
    const paypalOrder = await paypalApiRequest<{ id: string }>("/v2/checkout/orders", {
      method: "POST",
      accessToken,
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.orderId,
            description: order.title,
            amount: {
              currency_code: "USD",
              value: order.amount.toFixed(2),
            },
          },
        ],
      }),
    });

    await updateCourseOrderPaymentRef(order.orderId, paypalOrder.id);
    return NextResponse.json({ paypalOrderId: paypalOrder.id, orderId: order.orderId });
  } catch (error) {
    console.error("PayPal create order error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
