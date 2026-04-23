import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

/**
 * Test Resend: soo booqo http://localhost:3000/api/test-email
 * Waxaa uu u diri fariin ADMIN_EMAIL. Haddii Resend shaqeeyo, "Last Used" Resend dashboard wuu u beddeli doonaa.
 */
export async function GET() {
  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_EMAIL not set in .env" },
      { status: 500 }
    );
  }

  const result = await sendEmail({
    to,
    subject: "Test - BaroSmart Resend",
    html: "<p>Tani waa fariin test. Resend waa shaqeynayaa.</p>",
  });

  if (!result.ok) {
    const key = process.env.RESEND_API_KEY;
    const debug =
      process.env.NODE_ENV === "development"
        ? {
            keyLoaded: !!key,
            keyLength: key?.length ?? 0,
            keyPrefix: key ? `${key.slice(0, 7)}...` : null,
          }
        : undefined;
    return NextResponse.json(
      { ok: false, error: result.error, debug },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Email sent. Check your inbox and Resend Dashboard (Last Used).",
    id: (result as { data?: { id?: string } }).data?.id,
  });
}
