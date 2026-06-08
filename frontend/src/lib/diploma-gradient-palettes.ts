export const DIPLOMA_GRADIENT_PALETTES = [
  "linear-gradient(135deg, #7dd3fc 0%, #3b82f6 45%, #1d4ed8 100%)",
  "linear-gradient(135deg, #c4b5fd 0%, #6366f1 45%, #4338ca 100%)",
  "linear-gradient(135deg, #5eead4 0%, #14b8a6 45%, #0f766e 100%)",
  "linear-gradient(135deg, #fdba74 0%, #f97316 45%, #c2410c 100%)",
  "linear-gradient(135deg, #f9a8d4 0%, #ec4899 45%, #9d174d 100%)",
  "linear-gradient(135deg, #fde047 0%, #eab308 45%, #a16207 100%)",
  "linear-gradient(135deg, #86efac 0%, #22c55e 45%, #166534 100%)",
  "linear-gradient(135deg, #93c5fd 0%, #2563eb 42%, #312e81 100%)",
  "linear-gradient(135deg, #a5b4fc 0%, #4f46e5 42%, #3730a3 100%)",
  "linear-gradient(135deg, #67e8f9 0%, #0891b2 42%, #164e63 100%)",
  "linear-gradient(135deg, #fca5a5 0%, #ef4444 45%, #991b1b 100%)",
  "linear-gradient(135deg, #6ee7b7 0%, #10b981 45%, #065f46 100%)",
] as const;

export const DIPLOMA_GRADIENT_ACCENTS = [
  "#2563eb",
  "#4f46e5",
  "#0d9488",
  "#ea580c",
  "#db2777",
  "#ca8a04",
  "#16a34a",
  "#1d4ed8",
  "#4338ca",
  "#0e7490",
  "#dc2626",
  "#059669",
] as const;

export const PLAN_THEME_GRADIENT_INDEX = {
  orange: 3,
  blue: 0,
  green: 6,
  red: 10,
} as const;

export function pickNextGradientIndex(current: number, total = DIPLOMA_GRADIENT_PALETTES.length): number {
  if (total <= 1) return 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * total);
  }
  return next;
}

function normalizeIndex(index: number, total = DIPLOMA_GRADIENT_PALETTES.length): number {
  return ((index % total) + total) % total;
}

export function gradientAtIndex(index: number): string {
  return DIPLOMA_GRADIENT_PALETTES[normalizeIndex(index)];
}

export function accentAtIndex(index: number): string {
  return DIPLOMA_GRADIENT_ACCENTS[normalizeIndex(index)];
}
