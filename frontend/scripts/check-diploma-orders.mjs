import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const pendingDiploma = await prisma.order.count({
  where: { kind: "DIPLOMA", status: "PENDING" },
});
const pendingAll = await prisma.order.count({ where: { status: "PENDING" } });

console.log("Pending diploma orders:", pendingDiploma);
console.log("Pending all orders (admin requests):", pendingAll);

await prisma.$disconnect();
await pool.end();
