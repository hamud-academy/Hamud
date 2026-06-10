import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { generateMfaCode } from "@/lib/mfa";

const RESET_CODE_TTL_MINUTES = 15;
const APP_NAME = "Hamud-Academy";

function canUseResendFallback() {
  const from = process.env.RESEND_FROM?.trim() ?? "";
  if (!process.env.RESEND_API_KEY?.trim() || !from.includes("@")) return false;
  if (/onboarding@resend\.dev/i.test(from)) return false;
  return true;
}

export type PasswordResetSendResult =
  | { ok: true; expiresAt: Date }
  | { ok: false; error: string };

export async function createAndSendPasswordResetChallenge(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<PasswordResetSendResult> {
  const recipientEmail = user.email.trim().toLowerCase();
  const code = generateMfaCode();
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

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
    subject: `${APP_NAME} password reset code`,
    text: `Hello${user.name ? ` ${user.name}` : ""},

We received a request to reset your ${APP_NAME} password.

Your reset code is: ${code}

It expires in ${RESET_CODE_TTL_MINUTES} minutes.

If you do not see this in your Inbox within a minute, check Spam/Promotions.

If you did not request a password reset, ignore this email.`,
    html: `
      <p>Hello${user.name ? ` ${user.name}` : ""},</p>
      <p>We received a request to reset your ${APP_NAME} password.</p>
      <p>Your reset code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>This code expires in ${RESET_CODE_TTL_MINUTES} minutes.</p>
      <p><strong>If you do not see this in your Inbox</strong>, please check your <strong>Spam</strong> or <strong>Promotions</strong> tab.</p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
    allowResendFallback: canUseResendFallback(),
    smtpHeaders: {
      "Auto-Submitted": "auto-generated",
    },
  });

  if (!emailResult.ok) {
    await prisma.mfaChallenge.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return { ok: false, error: "Reset code could not be sent. Please try again later." };
  }

  return { ok: true, expiresAt };
}
