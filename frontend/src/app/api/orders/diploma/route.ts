import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createDiplomaCheckoutOrder, parseDiplomaCheckoutBody } from "@/lib/checkout-orders";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const orderLimit = checkRateLimit(rateLimitKeyFromRequest(request, "diploma-order"), {
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
    const parsed = await parseDiplomaCheckoutBody(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Invalid data. Please fill in all required fields." },
        { status: 400 }
      );
    }

    const order = await createDiplomaCheckoutOrder(parsed.data);
    revalidatePath("/admin/requests");

    return NextResponse.json({ success: true, orderId: order.orderId });
  } catch (error) {
    console.error("Diploma order create error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong. Please try again.";
    const status =
      message.includes("not found") || message.includes("password") || message.includes("Password")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
