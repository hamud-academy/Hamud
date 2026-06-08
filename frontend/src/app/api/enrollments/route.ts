import { NextResponse } from "next/server";

/**
 * Direct self-enrollment is disabled. Students must enroll through a paid/approved order.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Direct enrollment is not allowed. Purchase the course and wait for order approval, or contact support.",
    },
    { status: 403 }
  );
}
