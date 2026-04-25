import { prisma } from "@/lib/prisma";

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
    const rows = await prisma.$queryRaw<Array<{ value: unknown }>>`
      SELECT value
      FROM app_configs
      WHERE key = ${key}
      LIMIT 1
    `;
    return rows[0]?.value ? (rows[0].value as T) : null;
  } catch {
    return null;
  }
}

export async function saveAppConfig<T>(key: string, value: T): Promise<void> {
  await ensureConfigTable();
  await prisma.$executeRaw`
    INSERT INTO app_configs (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
  `;
}
