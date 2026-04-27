import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const contactLimit = checkRateLimit(rateLimitKeyFromRequest(request, "contact"), {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!contactLimit.allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(contactLimit.retryAfter) },
        }
      );
    }

    const body = await request.json();
    const { fullName, email, message } = body;
    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Full name, email and message are required." }, { status: 400 });
    }
    // Optional: send email via Resend, save to DB, etc.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
