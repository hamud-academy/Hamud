import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, subject, message } = body;
    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Full name, email and message are required." }, { status: 400 });
    }
    // Optional: send email via Resend, save to DB, etc.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
