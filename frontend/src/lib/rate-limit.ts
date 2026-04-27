import type { NextRequest } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

const globalBuckets = globalThis as unknown as {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalBuckets.__rateLimitBuckets ?? new Map<string, Bucket>();
globalBuckets.__rateLimitBuckets = buckets;

export function rateLimitKeyFromRequest(request: NextRequest, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${scope}:${forwardedFor || realIp || "unknown"}`;
}

export function rateLimitKeyFromString(value: string) {
  return value.trim().toLowerCase();
}

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
