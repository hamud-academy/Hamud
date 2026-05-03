import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitKeyFromRequest, rateLimitKeyFromString } from "@/lib/rate-limit";
import { createAndSendMfaChallenge } from "@/lib/mfa";

const startMfaSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function POST(request: NextRequest) {
  const ipLimit = checkRateLimit(rateLimitKeyFromRequest(request, "mfa-start"), {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = startMfaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const { password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();
  const emailLimit = checkRateLimit(rateLimitKeyFromString(`mfa-start:${email}`), {
    limit: 4,
    windowMs: 15 * 60 * 1000,
  });
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many code requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.role === UserRole.ADMIN) {
    return NextResponse.json({ ok: true, mfaRequired: false });
  }

  const result = await createAndSendMfaChallenge(user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    mfaRequired: true,
    message: `Security code sent to ${maskEmail(user.email.trim().toLowerCase())}. If you do not see it in a minute, check Spam/Promotions.`,
    sentTo: maskEmail(user.email.trim().toLowerCase()),
    expiresAt: result.expiresAt.toISOString(),
  });
}
