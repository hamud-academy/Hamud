import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { getPendingDiplomaOrders, getDiplomaOrders } from "../src/lib/diploma-checkout";

async function main() {
  console.log("=== Diploma Orders Diagnostic (unified orders table) ===\n");

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('orders', 'diploma_orders', 'app_configs')
    ORDER BY tablename
  `;
  console.log("Tables:", tables.map((t) => t.tablename).join(", "));

  const kindCol = await prisma.$queryRaw<{ column_name: string; data_type: string; udt_name: string }[]>`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'kind'
  `;
  console.log("orders.kind column:", kindCol[0] ?? "MISSING");

  const pendingDiplomaRaw = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM orders WHERE kind = 'DIPLOMA' AND status = 'PENDING'
  `;
  console.log("raw PENDING diploma count:", pendingDiplomaRaw[0]?.count?.toString() ?? "0");

  const prismaCount = await prisma.order.count({ where: { kind: "DIPLOMA" } }).catch((e: Error) => `ERROR: ${e.message}`);
  console.log("prisma.order (DIPLOMA) count:", prismaCount);

  const legacy = await prisma.appConfig.findUnique({ where: { key: "diploma-orders" } }).catch(() => null);
  const legacyCount = Array.isArray(legacy?.value) ? legacy.value.length : 0;
  console.log("legacy app_configs diploma-orders:", legacyCount, "orders");

  const all = await getDiplomaOrders().catch((e: Error) => {
    console.error("getDiplomaOrders ERROR:", e.message);
    return [];
  });
  console.log("getDiplomaOrders():", all.length);
  for (const o of all.slice(0, 10)) {
    console.log(` - ${o.id} ${o.status} ${o.programTitle} ${o.email}`);
  }

  const pending = await getPendingDiplomaOrders().catch((e: Error) => {
    console.error("getPendingDiplomaOrders ERROR:", e.message);
    return [];
  });
  console.log("getPendingDiplomaOrders():", pending.length);

  const adminPending = await prisma.order.count({ where: { status: "PENDING" } });
  console.log("admin requests total PENDING (courses + diplomas):", adminPending);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
