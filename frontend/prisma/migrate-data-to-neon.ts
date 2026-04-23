/**
 * Copy data from OLD PostgreSQL (localhost) to NeonDB.
 * Run: npx tsx prisma/migrate-data-to-neon.ts
 * Requires OLD_DATABASE_URL in .env (see step 1 in MIGRATE-DATA.md).
 */
import "dotenv/config";
import { Client } from "pg";

const OLD_URL = process.env.OLD_DATABASE_URL;
const NEW_URL = process.env.DATABASE_URL;

if (!OLD_URL) {
  console.error("ERROR: OLD_DATABASE_URL ma jiro .env. Riix MIGRATE-DATA.md talaabada 1.");
  process.exit(1);
}
if (!NEW_URL) {
  console.error("ERROR: DATABASE_URL ma jiro .env.");
  process.exit(1);
}

// Order: respect foreign keys (categories, users first; then courses, modules, lessons; then enrollments, lesson_completions, orders, testimonies)
const TABLES = [
  "categories",
  "users",
  "courses",
  "modules",
  "lessons",
  "enrollments",
  "lesson_completions",
  "orders",
  "testimonies",
];

async function main() {
  const oldClient = new Client({ connectionString: OLD_URL });
  const newClient = new Client({ connectionString: NEW_URL });

  try {
    await oldClient.connect();
    console.log("✓ Xiriirka database-kii hore (OLD) waa la furan.");
    await newClient.connect();
    console.log("✓ Xiriirka NeonDB (NEW) waa la furan.\n");
  } catch (e) {
    console.error("Xiriirka database-ka waa fashilmay:", e);
    process.exit(1);
  }

  for (const table of TABLES) {
    try {
      const res = await oldClient.query(`SELECT * FROM "${table}"`);
      const rows = res.rows;
      if (rows.length === 0) {
        console.log(`  [${table}] 0 rows – waan ka booday.`);
        continue;
      }
      const cols = res.fields.map((f) => f.name);
      const colList = cols.map((c) => `"${c}"`).join(", ");
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      const insertSql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;
      let inserted = 0;
      for (const row of rows) {
        const values = cols.map((c) => row[c]);
        const r = await newClient.query(insertSql, values);
        if (r.rowCount && r.rowCount > 0) inserted += r.rowCount;
      }
      console.log(`  [${table}] ${rows.length} rows (${inserted} cusub la geliyey).`);
    } catch (e) {
      console.error(`  [${table}] cillad:`, e);
    }
  }

  await oldClient.end();
  await newClient.end();
  console.log("\n✓ Dhamaad. Xogta waa lagu soo guuray NeonDB.");
}

main();
