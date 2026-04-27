import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";

const CONFIG_KEY = "payment-numbers";

export type PaymentNumber = {
  id: string;
  icon: string;
  label: string;
  value: string;
  note: string;
  iconSize: number;
};

export const defaultPaymentNumbers: PaymentNumber[] = [
  { id: "edahab", icon: "🇸🇴", label: "eDahab", value: "*110*625070785*$$$$$$$#", note: "", iconSize: 22 },
  { id: "evc", icon: "🇸🇴", label: "EVC+", value: "*712*615070785*$$$$$$$#", note: "", iconSize: 22 },
  { id: "zaad", icon: "🇸🇴", label: "ZAAD", value: "*880*0615070785*$$$$$$$#", note: "", iconSize: 22 },
  { id: "sahal", icon: "🇸🇴", label: "SAHAL", value: "*883*0615070785*$$$$$$$#", note: "", iconSize: 22 },
  { id: "waafi", icon: "🇩🇯", label: "WAAFI APP (DJIBOUTI) WALLET NUMBER", value: "0615070785", note: "", iconSize: 22 },
  { id: "ebirr", icon: "🇪🇹", label: "eBirr", value: "+251915919901", note: "Wajaale Exchange Rate.", iconSize: 22 },
  { id: "mpesa", icon: "🇰🇪", label: "MPESA", value: "+254712868567", note: "", iconSize: 22 },
  { id: "salaam", icon: "🇸🇴", label: "Salaam Bank Account", value: "35-16-99-99", note: "", iconSize: 22 },
  { id: "ibs", icon: "🇸🇴", label: "IBS Bank Account", value: "0106940300840012", note: "", iconSize: 22 },
  { id: "premier-teller", icon: "🇸🇴", label: "Premier Bank Teller ID", value: "749096", note: "", iconSize: 22 },
  { id: "premier-account", icon: "🇸🇴", label: "Premier Bank Account", value: "02-06-05-39-90-01", note: "", iconSize: 22 },
  { id: "taaj", icon: "🌍", label: "TAAJ Transfer EVC+", value: "+252615070785", note: "", iconSize: 22 },
  { id: "dahabshiil", icon: "🌍", label: "DAHABSHIIL Transfer eDahab", value: "+252625070785", note: "", iconSize: 22 },
];

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function normalizePaymentNumber(value: unknown, index: number): PaymentNumber {
  const item = value && typeof value === "object" ? (value as Partial<PaymentNumber>) : {};
  const iconSize = Number(item.iconSize);
  return {
    id: str(item.id) || `payment-${index + 1}`,
    icon: str(item.icon) || "💳",
    label: str(item.label) || "Payment method",
    value: str(item.value),
    note: str(item.note),
    iconSize: Number.isFinite(iconSize) ? Math.min(48, Math.max(12, iconSize)) : 22,
  };
}

export function normalizePaymentNumbers(value: unknown): PaymentNumber[] {
  if (!Array.isArray(value)) return defaultPaymentNumbers;
  const items = value
    .map((item, index) => normalizePaymentNumber(item, index))
    .filter((item) => item.label || item.value);
  return items.length ? items : defaultPaymentNumbers;
}

export async function getPaymentNumbers(): Promise<PaymentNumber[]> {
  const config = await getAppConfig<unknown>(CONFIG_KEY);
  return normalizePaymentNumbers(config);
}

export async function savePaymentNumbers(numbers: PaymentNumber[]): Promise<PaymentNumber[]> {
  const normalized = normalizePaymentNumbers(numbers);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}
