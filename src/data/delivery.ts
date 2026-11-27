import type { DeliveryMethod, DeliveryMethodId } from "@/types/commerce";

/**
 * DELIVERY PLACEHOLDERS.
 * Fees are stand-in amounts, not confirmed rates.
 */
export const DELIVERY_METHODS: readonly DeliveryMethod[] = [
  {
    id: "collect",
    name: "Collection",
    fee: 0,
    enabled: true,
    summary: "Placeholder. Collect from the studio. Not a confirmed option.",
  },
  {
    id: "standard",
    name: "Standard delivery",
    fee: 8,
    enabled: true,
    summary: "Placeholder fee. Not a confirmed delivery rate.",
  },
  {
    id: "express",
    name: "Express delivery",
    fee: 16,
    enabled: true,
    summary: "Placeholder fee. Not a confirmed delivery rate.",
  },
];

export function deliveryMethod(id: DeliveryMethodId): DeliveryMethod | undefined {
  return DELIVERY_METHODS.find((method) => method.id === id);
}
