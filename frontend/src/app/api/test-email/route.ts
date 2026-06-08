import { NextResponse } from "next/server";
import { DEFAULT_SITE_NAME } from "@/lib/default-site";
import { getAdminNotificationEmail, notifyAdminByEmail } from "@/lib/resend";

/**
 * Test email sender: soo booqo http://localhost:3000/api/test-email
 * Waxaa uu u diri fariin hamud26academy@gmail.com adigoo isticmaalaya SMTP/Gmail ama Resend fallback.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const to = await getAdminNotificationEmail();
  const result = await notifyAdminByEmail({
    subject: `Test - ${DEFAULT_SITE_NAME} Email`,
    html: "<p>Tani waa fariin test. Email sender-ku waa shaqeynayaa.</p>",
  });

  if (!result.ok) {
    const debug =
      process.env.NODE_ENV === "development"
        ? {
            to,
            smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
            resendConfigured: !!process.env.RESEND_API_KEY,
          }
        : undefined;
    return NextResponse.json(
      { ok: false, error: result.error, debug },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Email sent to ${to}. Check your inbox.`,
  });
}
