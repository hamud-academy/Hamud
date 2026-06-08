import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, rateLimitKeyFromRequest } from "@/lib/rate-limit";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  message: z.string().trim().min(10, "Message is too short").max(5000),
});

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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Optional: send email via Resend, save to DB, etc.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
