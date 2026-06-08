import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createCourseCheckoutOrder, parseCourseCheckoutBody } from "@/lib/checkout-orders";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";

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
    const parsed = await parseCourseCheckoutBody(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Invalid data. Please fill in all required fields." },
        { status: 400 }
      );
    }

    const order = await createCourseCheckoutOrder(parsed.data);
    revalidatePath("/admin/requests");

    return NextResponse.json({ success: true, orderId: order.orderId });
  } catch (e) {
    console.error("Order create error:", e);
    const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
    const status = message.includes("password") || message.includes("Password") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
