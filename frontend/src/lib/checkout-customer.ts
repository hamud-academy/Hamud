import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { CheckoutCustomer } from "@/lib/checkout-customer-types";

export type { CheckoutCustomer } from "@/lib/checkout-customer-types";
export { splitFullName } from "@/lib/checkout-customer-types";

function ensureCheckoutFullName(name: string | null | undefined, email: string): string {
  const trimmed = (name ?? "").trim();
  if (trimmed.length >= 2) return trimmed;
  const fromEmail = email.split("@")[0]?.trim() ?? "";
  if (fromEmail.length >= 2) return fromEmail;
  return "Student";
}

export async function getLoggedInCheckoutCustomer(): Promise<CheckoutCustomer | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const userId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role;
  if (!userId || role !== "STUDENT") return null;

  const email = session.user.email.trim().toLowerCase();

  const [user, latestOrder] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    }),
    prisma.order.findFirst({
      where: { OR: [{ userId }, { email }] },
      orderBy: { createdAt: "desc" },
      select: {
        fullName: true,
        phone: true,
        country: true,
        address: true,
        region: true,
        postcode: true,
      },
    }),
  ]);

  if (!user) return null;

  const fullName = ensureCheckoutFullName(latestOrder?.fullName ?? user.name, email);

  return {
    userId: user.id,
    fullName,
    email: user.email,
    phone: latestOrder?.phone ?? undefined,
    country: latestOrder?.country ?? undefined,
    address: latestOrder?.address ?? undefined,
    region: latestOrder?.region ?? undefined,
    postcode: latestOrder?.postcode ?? undefined,
  };
}
