import { OrderKind, OrderStatus, type Order as PrismaOrder } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { getDiplomaConfig } from "@/lib/diploma-config";
import {
  isDiplomaPlanType,
  parseDiplomaPlanPrice,
  type DiplomaCheckoutContext,
  type DiplomaOrder,
} from "@/lib/diploma-checkout-utils";

export type { DiplomaCheckoutContext, DiplomaOrder, DiplomaOrderStatus } from "@/lib/diploma-checkout-utils";
export {
  buildDiplomaCheckoutHref,
  isDiplomaPlanType,
  parseDiplomaPlanPrice,
} from "@/lib/diploma-checkout-utils";

const LEGACY_ORDERS_KEY = "diploma-orders";
const LEGACY_MIGRATED_KEY = "diploma-orders-migrated";
let legacyMigrationDone = false;
let legacyMigrationPromise: Promise<void> | null = null;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

function mapRowToDiplomaOrder(row: PrismaOrder): DiplomaOrder {
  return {
    id: row.id,
    programId: row.programId ?? "",
    programSlug: row.programSlug ?? "",
    programTitle: row.programTitle ?? "",
    planType: (row.planType ?? "EXPRESS") as DiplomaOrder["planType"],
    planTitle: row.planTitle ?? "",
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    country: row.country,
    address: row.address,
    region: row.region,
    postcode: row.postcode,
    paymentMethod: row.paymentMethod,
    paymentRef: row.paymentRef,
    amount: Number(row.amount),
    passwordHash: row.passwordHash,
    status: row.status === OrderStatus.PAID ? "PAID" : "PENDING",
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
  };
}

function mapDiplomaOrderToCreateData(order: DiplomaOrder) {
  return {
    id: order.id,
    kind: OrderKind.DIPLOMA,
    programId: order.programId,
    programSlug: order.programSlug,
    programTitle: order.programTitle,
    planType: order.planType,
    planTitle: order.planTitle,
    fullName: order.fullName,
    email: order.email.trim().toLowerCase(),
    phone: order.phone ?? null,
    country: order.country ?? null,
    address: order.address ?? null,
    region: order.region ?? null,
    postcode: order.postcode ?? null,
    paymentMethod: order.paymentMethod,
    paymentRef: order.paymentRef ?? null,
    amount: order.amount,
    passwordHash: order.passwordHash ?? null,
    status: order.status === "PAID" ? OrderStatus.PAID : OrderStatus.PENDING,
    createdAt: new Date(order.createdAt),
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    userId: order.userId ?? null,
    courseId: null as string | null,
  };
}

async function importLegacyDiplomaOrder(order: DiplomaOrder) {
  if (!order?.id || !order.email) return;

  const existing = await prisma.order.findUnique({
    where: { id: order.id },
    select: { id: true, kind: true },
  });
  if (existing) return;

  try {
    await prisma.order.create({
      data: mapDiplomaOrderToCreateData(order),
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return;
    throw error;
  }
}

async function runLegacyDiplomaOrderMigration() {
  const alreadyMigrated = await getAppConfig<boolean>(LEGACY_MIGRATED_KEY);
  if (alreadyMigrated) return;

  const legacyOrders = await getAppConfig<DiplomaOrder[]>(LEGACY_ORDERS_KEY);
  if (!Array.isArray(legacyOrders) || legacyOrders.length === 0) {
    await saveAppConfig(LEGACY_MIGRATED_KEY, true);
    return;
  }

  for (const order of legacyOrders) {
    try {
      await importLegacyDiplomaOrder(order);
    } catch (error) {
      console.error(`Legacy diploma order import failed (${order?.id ?? "unknown"}):`, error);
    }
  }

  await saveAppConfig(LEGACY_MIGRATED_KEY, true);
}

async function migrateLegacyDiplomaOrdersIfNeeded() {
  if (legacyMigrationDone) return;

  if (!legacyMigrationPromise) {
    legacyMigrationPromise = runLegacyDiplomaOrderMigration()
      .catch((error) => {
        console.error("Legacy diploma order migration error:", error);
      })
      .finally(() => {
        legacyMigrationDone = true;
        legacyMigrationPromise = null;
      });
  }

  await legacyMigrationPromise;
}

export async function migrateLegacyDiplomaOrdersOnLoad() {
  await migrateLegacyDiplomaOrdersIfNeeded();
}

export async function getDiplomaCheckoutContext(
  programSlug: string,
  planType: string
): Promise<DiplomaCheckoutContext | null> {
  if (!isDiplomaPlanType(planType)) return null;

  const config = await getDiplomaConfig();
  const program = config.programs.find(
    (item) => item.slug === programSlug || item.id === programSlug
  );

  if (!program || program.status !== "PUBLISHED") return null;

  const plan = program.paymentPlans.find((item) => item.type === planType);
  if (!plan) return null;

  return {
    program,
    plan,
    amount: parseDiplomaPlanPrice(plan.price),
  };
}

export async function getDiplomaOrders(): Promise<DiplomaOrder[]> {
  await migrateLegacyDiplomaOrdersIfNeeded();
  const rows = await prisma.order.findMany({
    where: { kind: OrderKind.DIPLOMA },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRowToDiplomaOrder);
}

export async function getPaidDiplomaProgramIdsForEmail(email: string): Promise<string[]> {
  await migrateLegacyDiplomaOrdersIfNeeded();
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await prisma.order.findMany({
    where: {
      kind: OrderKind.DIPLOMA,
      status: OrderStatus.PAID,
      email: normalizedEmail,
    },
    select: { programId: true },
  });
  return Array.from(new Set(rows.map((row) => row.programId).filter(Boolean))) as string[];
}

export async function getPendingDiplomaOrders(): Promise<DiplomaOrder[]> {
  await migrateLegacyDiplomaOrdersIfNeeded();
  const rows = await prisma.order.findMany({
    where: { kind: OrderKind.DIPLOMA, status: OrderStatus.PENDING },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRowToDiplomaOrder);
}

export async function getDiplomaOrderById(id: string): Promise<DiplomaOrder | null> {
  await migrateLegacyDiplomaOrdersIfNeeded();
  const row = await prisma.order.findFirst({
    where: { id, kind: OrderKind.DIPLOMA },
  });
  return row ? mapRowToDiplomaOrder(row) : null;
}

export async function saveDiplomaOrder(order: DiplomaOrder): Promise<DiplomaOrder> {
  try {
    const row = await prisma.order.create({
      data: mapDiplomaOrderToCreateData(order),
    });
    return mapRowToDiplomaOrder(row);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const existing = await getDiplomaOrderById(order.id);
      if (existing) return existing;
    }
    throw error;
  }
}

export async function updateDiplomaOrder(
  id: string,
  updater: (order: DiplomaOrder) => DiplomaOrder
): Promise<DiplomaOrder | null> {
  const existing = await getDiplomaOrderById(id);
  if (!existing) return null;

  const next = updater(existing);
  const row = await prisma.order.update({
    where: { id },
    data: {
      paymentRef: next.paymentRef ?? null,
      status: next.status === "PAID" ? OrderStatus.PAID : OrderStatus.PENDING,
      paidAt: next.paidAt ? new Date(next.paidAt) : null,
    },
  });
  return mapRowToDiplomaOrder(row);
}

export async function removeDiplomaOrder(id: string): Promise<boolean> {
  try {
    const order = await prisma.order.findFirst({
      where: { id, kind: OrderKind.DIPLOMA },
    });
    if (!order) return false;
    await prisma.order.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
