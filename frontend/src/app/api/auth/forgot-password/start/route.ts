import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitKeyFromRequest, rateLimitKeyFromString } from "@/lib/rate-limit";
import { createAndSendPasswordResetChallenge } from "@/lib/password-reset";

const startSchema = z.object({
  email: z.string().email("Invalid email"),
});

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const ipLimit = checkRateLimit(rateLimitKeyFromRequest(request, "forgot-password"), {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
    );
  }

  const emailLimit = checkRateLimit(rateLimitKeyFromString(`forgot-password:${email}`), {
    limit: 4,
    windowMs: 15 * 60 * 1000,
  });
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many reset attempts for this email. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No account found with this email address." },
      { status: 404 }
    );
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "This account cannot reset its password online. Please contact support." },
      { status: 400 }
    );
  }

  const result = await createAndSendPasswordResetChallenge(user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    sentTo: maskEmail(email),
    message: `Reset code sent to ${maskEmail(email)}. Check Spam/Promotions if you do not see it.`,
    expiresAt: result.expiresAt.toISOString(),
  });
}
