import { Resend } from "resend";

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Resend] RESEND_API_KEY not set in .env - email will not be sent.");
    }
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const resend = new Resend(apiKey);
  const to = Array.isArray(options.to) ? options.to : [options.to];
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
