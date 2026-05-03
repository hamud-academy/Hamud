import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

const MFA_CODE_TTL_MINUTES = 10;
const MFA_MAX_ATTEMPTS = 5;
const APP_NAME = "Hamud-Academy";

/** Resend sandbox (onboarding@resend.dev) cannot deliver to arbitrary student inboxes. */
function canUseResendMfaFallback() {
  const from = process.env.RESEND_FROM?.trim() ?? "";
  if (!process.env.RESEND_API_KEY?.trim() || !from.includes("@")) return false;
  if (/onboarding@resend\.dev/i.test(from)) return false;
  return true;
}

export type MfaSendResult =
  | { ok: true; expiresAt: Date }
  | { ok: false; error: string };

export function generateMfaCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function createAndSendMfaChallenge(user: { id: string; email: string; name?: string | null }): Promise<MfaSendResult> {
  const recipientEmail = user.email.trim().toLowerCase();
  const code = generateMfaCode();
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + MFA_CODE_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.mfaChallenge.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    prisma.mfaChallenge.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    }),
  ]);

  const emailResult = await sendEmail({
    to: recipientEmail,
    subject: `${APP_NAME} verification code`,
    text: `Hello${user.name ? ` ${user.name}` : ""},

Your ${APP_NAME} sign-in code is: ${code}

It expires in ${MFA_CODE_TTL_MINUTES} minutes.

If you do not see this in your Inbox within a minute, open your Spam/Junk folder — Gmail often filters automated messages there.

If you did not try to sign in, ignore this email.`,
    html: `
      <p>Hello${user.name ? ` ${user.name}` : ""},</p>
      <p>Your ${APP_NAME} sign-in code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>This code expires in ${MFA_CODE_TTL_MINUTES} minutes.</p>
      <p><strong>If you do not see this in your Inbox</strong>, please check your <strong>Spam</strong> or <strong>Promotions</strong> tab — Gmail often filters automated mail there.</p>
      <p>If you did not try to sign in, you can ignore this email.</p>
    `,
    allowResendFallback: canUseResendMfaFallback(),
    smtpHeaders: {
      "Auto-Submitted": "auto-generated",
    },
  });

  if (!emailResult.ok) {
    await prisma.mfaChallenge.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return { ok: false, error: "Security code could not be sent. Please try again later." };
  }

  console.log(`[MFA] Security code sent to ${maskEmail(recipientEmail)}`);
  return { ok: true, expiresAt };
}

export async function verifyAndConsumeMfaCode(userId: string, code: string) {
  const normalizedCode = code.trim();
  if (!/^\d{6}$/.test(normalizedCode)) return false;

  const challenge = await prisma.mfaChallenge.findFirst({
    where: {
      userId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.attempts >= MFA_MAX_ATTEMPTS) return false;

  const valid = await bcrypt.compare(normalizedCode, challenge.codeHash);
  if (!valid) {
    await prisma.mfaChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.mfaChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
  return true;
}
