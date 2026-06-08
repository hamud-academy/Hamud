import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS app_configs (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
)`;

async function ensureConfigTable() {
  await prisma.$executeRawUnsafe(TABLE_SQL);
}

export async function getAppConfig<T>(key: string): Promise<T | null> {
  try {
    await ensureConfigTable();
    const row = await prisma.appConfig.findUnique({
      where: { key },
      select: { value: true },
    });
    if (!row?.value) return null;
    return row.value as T;
  } catch (error) {
    console.error(`getAppConfig(${key}) error:`, error);
    return null;
  }
}

export async function saveAppConfig<T>(key: string, value: T): Promise<void> {
  await ensureConfigTable();
  const jsonValue = value as Prisma.InputJsonValue;
  await prisma.appConfig.upsert({
    where: { key },
    create: { key, value: jsonValue },
    update: { value: jsonValue },
  });
}
