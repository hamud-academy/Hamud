const LOCAL_FALLBACK = "postgresql://postgres:postgres@localhost:5432/barosmart";

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return LOCAL_FALLBACK;
}
