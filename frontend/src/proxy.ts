import { NextRequest, NextResponse } from "next/server";

const BLOCKED_IN_PRODUCTION = ["/api/test-email"];

/**
 * Dev server short-circuits /favicon.ico with an empty 404 before App Router runs.
 * Rewrite to an API route so the real favicon is served.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NODE_ENV === "production" && BLOCKED_IN_PRODUCTION.includes(pathname)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pathname === "/favicon.ico") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/site-favicon";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/favicon.ico", "/api/test-email"],
};
