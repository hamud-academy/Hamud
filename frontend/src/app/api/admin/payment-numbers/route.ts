import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPaymentNumbers, normalizePaymentNumbers, savePaymentNumbers } from "@/lib/payment-numbers";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return unauthorized();

  const numbers = await getPaymentNumbers();
  return NextResponse.json({ numbers });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body && typeof body === "object" ? (body as { numbers?: unknown }) : {};
  const numbers = normalizePaymentNumbers(data.numbers);

  try {
    const saved = await savePaymentNumbers(numbers);
    return NextResponse.json({ numbers: saved });
  } catch (error) {
    console.error("payment-numbers save error:", error);
    return NextResponse.json({ error: "Failed to save payment numbers" }, { status: 500 });
  }
}
