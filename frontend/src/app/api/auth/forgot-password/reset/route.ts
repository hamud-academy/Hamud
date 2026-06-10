import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitKeyFromRequest, rateLimitKeyFromString } from "@/lib/rate-limit";
import { verifyAndConsumeMfaCode } from "@/lib/mfa";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";

const resetSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().regex(/^\d{6}$/, "Invalid code"),
  password: z.string().refine(isStrongPassword, { message: strongPasswordMessage() }),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { code, password } = parsed.data;

  const ipLimit = checkRateLimit(rateLimitKeyFromRequest(request, "forgot-password-reset"), {
    limit: 12,
    windowMs: 15 * 60 * 1000,
  });
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
    );
  }

  const emailLimit = checkRateLimit(rateLimitKeyFromString(`forgot-password-reset:${email}`), {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts for this email. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid or expired reset code." }, { status: 400 });
  }

  const validCode = await verifyAndConsumeMfaCode(user.id, code);
  if (!validCode) {
    return NextResponse.json({ error: "Invalid or expired reset code." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  return NextResponse.json({ ok: true });
}
