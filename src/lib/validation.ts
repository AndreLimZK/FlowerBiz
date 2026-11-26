import type { BouquetConfiguration } from "@/types/bouquet";

export function isBouquetConfiguration(
  value: unknown,
): value is BouquetConfiguration {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    schemaVersion?: unknown;
    flowers?: unknown;
    wrappingId?: unknown;
    stemOptionId?: unknown;
    ribbonId?: unknown;
  };

  return (
    candidate.schemaVersion === 1 &&
    Array.isArray(candidate.flowers) &&
    typeof candidate.wrappingId === "string" &&
    typeof candidate.stemOptionId === "string" &&
    typeof candidate.ribbonId === "string"
  );
}
