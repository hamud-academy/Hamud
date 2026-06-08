import "dotenv/config";
import { Client } from "pg";

const url = process.env.DATABASE_URL || process.env.OLD_DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL or OLD_DATABASE_URL");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  const tables = await client.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log("Tables in database:\n");
  let total = 0;
  for (const { tablename } of tables.rows) {
    const n = await client.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM "${tablename}"`);
    const count = n.rows[0]?.n ?? 0;
    total += count;
    console.log(`  ${tablename.padEnd(28)} ${count}`);
  }
  console.log(`\nTotal rows: ${total}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
