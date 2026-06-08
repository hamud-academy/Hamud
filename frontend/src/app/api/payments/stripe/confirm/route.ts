import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";
import { confirmStripeCheckoutSession } from "@/lib/stripe-checkout";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(rateLimitKeyFromRequest(request, "stripe-confirm"), {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const { sessionId } = (await request.json()) as { sessionId?: string };
    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 200) {
      return NextResponse.json({ error: "Missing session ID." }, { status: 400 });
    }

    const result = await confirmStripeCheckoutSession(sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Stripe confirm error:", error);
    return NextResponse.json({ error: "Unable to verify payment." }, { status: 500 });
  }
}
