/**
 * Copy ALL data from one PostgreSQL database to another (Neon → Neon).
 *
 * Setup in .env:
 *   OLD_DATABASE_URL = source (database-kii hore)
 *   NEW_DATABASE_URL = target (database-ka cusub) — ama isticmaal DATABASE_URL
 *
 * Run:
 *   npx tsx prisma/migrate-neon-to-neon.ts
 *   npx tsx prisma/migrate-neon-to-neon.ts --push-schema   # schema + data
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { Client } from "pg";

const SOURCE_URL = process.env.OLD_DATABASE_URL?.trim();
const TARGET_URL = process.env.NEW_DATABASE_URL?.trim();
const PUSH_SCHEMA = process.argv.includes("--push-schema");

if (!SOURCE_URL) {
  console.error("ERROR: OLD_DATABASE_URL ma jiro .env (database-kii hore).");
  process.exit(1);
}
if (!TARGET_URL) {
  console.error("ERROR: NEW_DATABASE_URL ma jiro .env (database-ka cusub / hamud Academy).");
  console.error("       Neon → Connect → Copy connection string → ku dar .env");
  process.exit(1);
}
if (SOURCE_URL === TARGET_URL) {
  console.error("ERROR: Source iyo target isku mid yihiin — hubi OLD_DATABASE_URL iyo NEW_DATABASE_URL.");
  process.exit(1);
}

function maskUrl(url: string) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}:***@${u.host}${u.pathname}`;
  } catch {
    return "(invalid url)";
  }
}

/** Insert order — respects foreign keys (parents before children). */
const TABLE_ORDER = [
  "categories",
  "users",
  "site_settings",
  "app_configs",
  "courses",
  "modules",
  "lessons",
  "lesson_quizzes",
  "lesson_quiz_questions",
  "lesson_quiz_options",
  "enrollments",
  "lesson_completions",
  "orders",
  "testimonies",
  "mfa_challenges",
];

function sortTables(tables: string[]) {
  const rank = new Map(TABLE_ORDER.map((t, i) => [t, i]));
  return [...tables].sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999));
}

async function listPublicTables(client: Client) {
  const res = await client.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  return sortTables(res.rows.map((r) => r.tablename));
}

async function tableExists(client: Client, table: string) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
    [table]
  );
  return (res.rowCount ?? 0) > 0;
}

async function countRows(client: Client, table: string) {
  const res = await client.query<{ n: number }>(`SELECT COUNT(*)::int AS n FROM "${table}"`);
  return res.rows[0]?.n ?? 0;
}

async function copyTable(source: Client, target: Client, table: string) {
  const meta = await source.query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  const cols = meta.rows.map((r) => r.column_name);
  const jsonCols = new Set(
    meta.rows.filter((r) => r.data_type === "json" || r.data_type === "jsonb").map((r) => r.column_name)
  );

  const selectList = cols
    .map((c) => (jsonCols.has(c) ? `"${c}"::text AS "${c}"` : `"${c}"`))
    .join(", ");
  const res = await source.query(`SELECT ${selectList} FROM "${table}"`);
  const rows = res.rows;
  if (rows.length === 0) {
    return { read: 0, inserted: 0 };
  }

  const colList = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols
    .map((c, i) => (jsonCols.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(", ");
  const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

  let inserted = 0;
  for (const row of rows) {
    const values = cols.map((c) => row[c]);
    const r = await target.query(insertSql, values);
    if (r.rowCount && r.rowCount > 0) inserted += r.rowCount;
  }
  return { read: rows.length, inserted };
}

async function main() {
  console.log("=== Neon → Neon data migration ===\n");
  console.log("Source (OLD):", maskUrl(SOURCE_URL));
  console.log("Target (NEW):", maskUrl(TARGET_URL));
  console.log("");

  if (PUSH_SCHEMA) {
    console.log("→ Push schema to target (prisma db push)...");
    execSync("npx prisma db push", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: TARGET_URL },
    });
    console.log("");
  }

  const source = new Client({ connectionString: SOURCE_URL });
  const target = new Client({ connectionString: TARGET_URL });

  try {
    await source.connect();
    console.log("✓ Source connected.");
    await target.connect();
    console.log("✓ Target connected.\n");
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }

  const tables = (await listPublicTables(source)).filter((t) => t !== "_prisma_migrations");
  if (tables.length === 0) {
    console.error("Source database has no public tables.");
    process.exit(1);
  }

  console.log(`Found ${tables.length} tables in source.\n`);

  try {
    await target.query("BEGIN");

    const targetTables = await listPublicTables(target).catch(() => []);
    if (targetTables.length > 0) {
      const quoted = targetTables.map((t) => `"${t}"`).join(", ");
      await target.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
      console.log(`Cleared ${targetTables.length} tables on target.\n`);
    }

    let totalRead = 0;
    let totalInserted = 0;

    for (const table of tables) {
      try {
        if (!(await tableExists(target, table))) {
          console.log(`  [${table}] SKIP — ma jiro target-ka (orod --push-schema)`);
          continue;
        }

        const { read, inserted } = await copyTable(source, target, table);
        totalRead += read;
        totalInserted += inserted;
        console.log(`  [${table}] ${read} rows read → ${inserted} inserted`);
      } catch (error) {
        console.error(`  [${table}] ERROR:`, error);
        throw error;
      }
    }

    await target.query("COMMIT");

    console.log("\n=== Verification ===");
    for (const table of tables) {
      const srcN = await countRows(source, table);
      const tgtN = await countRows(target, table).catch(() => -1);
      const ok = tgtN === srcN ? "OK" : "MISMATCH";
      console.log(`  [${table}] source=${srcN} target=${tgtN} ${ok}`);
    }

    console.log(`\n✓ Done. ${totalRead} rows read, ${totalInserted} inserted.`);
    console.log("\nNext steps:");
    console.log("  1. Beddel DATABASE_URL → NEW_DATABASE_URL .env iyo Vercel");
    console.log("  2. Restart dev server / redeploy Vercel");
    console.log("  3. Ka saar OLD_DATABASE_URL iyo NEW_DATABASE_URL .env (optional)");
  } catch (error) {
    await target.query("ROLLBACK").catch(() => undefined);
    console.error("\nMigration failed — rolled back.", error);
    process.exit(1);
  } finally {
    await source.end();
    await target.end();
  }
}

main();
