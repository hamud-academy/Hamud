import { NextRequest, NextResponse } from "next/server";

/**
 * Dev server short-circuits /favicon.ico with an empty 404 before App Router runs.
 * Rewrite to an API route so the real favicon is served.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/favicon.ico") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/site-favicon";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/favicon.ico",
};
