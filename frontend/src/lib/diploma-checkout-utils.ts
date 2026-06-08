import {
  DIPLOMA_PLAN_TYPES,
  type DiplomaPaymentPlanConfig,
  type DiplomaPlanType,
  type DiplomaProgramConfig,
} from "@/lib/diploma-config-defaults";

export type DiplomaOrderStatus = "PENDING" | "PAID";

export type DiplomaOrder = {
  id: string;
  programId: string;
  programSlug: string;
  programTitle: string;
  planType: DiplomaPlanType;
  planTitle: string;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  region?: string | null;
  postcode?: string | null;
  paymentMethod: string;
  paymentRef?: string | null;
  amount: number;
  passwordHash: string | null;
  userId?: string | null;
  status: DiplomaOrderStatus;
  createdAt: string;
  paidAt?: string | null;
};

export type DiplomaCheckoutContext = {
  program: DiplomaProgramConfig;
  plan: DiplomaPaymentPlanConfig;
  amount: number;
};

export function buildCourseCheckoutHref(slug: string, options?: { fromDashboard?: boolean }) {
  if (options?.fromDashboard) {
    return `/dashboard/checkout/course/${encodeURIComponent(slug)}`;
  }
  return `/checkout/${encodeURIComponent(slug)}`;
}

export function buildDiplomaCheckoutHref(
  programSlug: string,
  planType: DiplomaPlanType,
  options?: { fromDashboard?: boolean }
) {
  const plan = `plan=${encodeURIComponent(planType)}`;
  if (options?.fromDashboard) {
    return `/dashboard/checkout/diploma/${encodeURIComponent(programSlug)}?${plan}`;
  }
  return `/checkout/diploma/${encodeURIComponent(programSlug)}?${plan}`;
}

export function parseDiplomaPlanPrice(price: string): number {
  const match = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

export function isDiplomaPlanType(value: string): value is DiplomaPlanType {
  return DIPLOMA_PLAN_TYPES.includes(value as DiplomaPlanType);
}
