import { NextResponse } from "next/server";

type CacheOptions = {
  browserMaxAge?: number;
  edgeMaxAge?: number;
  staleWhileRevalidate?: number;
};

const defaultCache: Required<CacheOptions> = {
  browserMaxAge: 60,
  edgeMaxAge: 300,
  staleWhileRevalidate: 3600,
};

export function publicCacheHeaders(options: CacheOptions = {}) {
  const cache = { ...defaultCache, ...options };

  return {
    "Cache-Control": `public, max-age=${cache.browserMaxAge}, s-maxage=${cache.edgeMaxAge}, stale-while-revalidate=${cache.staleWhileRevalidate}`,
  };
}

export function jsonWithPublicCache<T>(
  data: T,
  options?: CacheOptions,
  init?: ResponseInit
) {
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(publicCacheHeaders(options))) {
    headers.set(key, value);
  }

  return NextResponse.json(data, {
    ...init,
    headers,
  });
}
