import { Resend } from "resend";
import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  allowResendFallback?: boolean;
  /** SMTP headers only (helps classification / deliverability). */
  smtpHeaders?: Record<string, string>;
};

function getRecipients(to: string | string[]) {
  return Array.isArray(to) ? to : [to];
}

/** Bare address for SMTP envelope/from auth (e.g. "Name <x@y.com>" → x@y.com). */
function envelopeFromAddress(fromHeader: string) {
  const m = fromHeader.match(/<\s*([^>\s]+)\s*>/);
  if (m) return m[1].trim();
  return fromHeader.trim();
}

async function sendWithSmtp(options: SendEmailOptions) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });

  try {
    const to = getRecipients(options.to);
    const info = await transporter.sendMail({
      from,
      to,
      envelope: {
        from: envelopeFromAddress(from),
        to,
      },
      subject: options.subject,
      html: options.html,
      text: options.text,
      headers: options.smtpHeaders,
    });
    const rejected = [...(info.rejected ?? []), ...(info.pending ?? [])];
    const acceptedRaw = [...(info.accepted ?? [])].map(String);
    const accepted = new Set(acceptedRaw.map((a) => a.toLowerCase()));
    const toNorm = to.map((r) => r.trim().toLowerCase()).filter(Boolean);
    const recipientsOk =
      rejected.length === 0 &&
      (acceptedRaw.length === 0 || toNorm.every((r) => accepted.has(r)));

    if (process.env.NODE_ENV === "development") {
      console.log("[Email][SMTP] response:", info.response, "| accepted:", acceptedRaw, "| rejected:", rejected, "| envelope:", info.envelope);
    }

    if (rejected.length > 0 || !recipientsOk) {
      console.error("[Email][SMTP] Deliver not confirmed:", { rejected, accepted: acceptedRaw, to: toNorm, response: info.response });
      const errText =
        rejected.length > 0
          ? `SMTP rejected recipient(s): ${rejected.join(", ")}`
          : "SMTP did not confirm all recipients.";
      return { ok: false, error: errText };
    }

    console.log("[Email][SMTP] Sent OK, id:", info.messageId);
    return { ok: true, data: info };
  } catch (error) {
    console.error("[Email][SMTP] Error:", error);
    return { ok: false, error };
  }
}

async function sendWithResend(options: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const rawFrom = process.env.RESEND_FROM?.trim();
  let fromEmail = "onboarding@resend.dev";
  if (rawFrom) {
    if (rawFrom.includes("@")) {
      fromEmail = rawFrom;
    } else {
      console.warn(
        '[Email][Resend] RESEND_FROM must include an email, e.g. "Hamud Academy <noreply@yourdomain.com>". Using onboarding@resend.dev.'
      );
    }
  }

  if (!apiKey) {
    return null;
  }

  const resend = new Resend(apiKey);
  const to = getRecipients(options.to);
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
  if (error) {
    console.error("[Resend] Error:", JSON.stringify(error, null, 2));
    return { ok: false, error };
  }
  console.log("[Resend] Sent OK, id:", data?.id);
  return { ok: true, data };
}

export async function sendEmail(options: SendEmailOptions) {
  const smtpResult = await sendWithSmtp(options);
  if (smtpResult) return smtpResult;

  if (options.allowResendFallback !== false) {
    const resendResult = await sendWithResend(options);
    if (resendResult) return resendResult;
  }

  const error = "Email service is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS.";
  if (process.env.NODE_ENV === "development") {
    console.warn(`[Email] ${error}`);
  }
  return { ok: false, error };
}
