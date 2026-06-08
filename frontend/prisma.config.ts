import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Neon pooler URLs break Prisma CLI (migrate/deploy). Use direct host for migrations. */
function resolveMigrationDatabaseUrl(): string {
  if (process.env.DIRECT_URL?.trim()) {
    return process.env.DIRECT_URL.trim();
  }

  const pooled = process.env.DATABASE_URL?.trim();
  if (pooled?.includes("-pooler.")) {
    return pooled.replace("-pooler.", ".");
  }

  return pooled ?? "postgresql://postgres:postgres@localhost:5432/barosmart";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveMigrationDatabaseUrl(),
  },
});
