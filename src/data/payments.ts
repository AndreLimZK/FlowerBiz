import type { PaymentMethod, PaymentMethodId, PaymentStatus } from "@/types/commerce";

/**
 * PAYMENT METHOD NAMES ONLY.
 * No card numbers, PayNow proxies, or bank account fields.
 * Card and PayNow name a simulated success for a later checkout step.
 * Bank transfer does not mark the payment paid.
 */
export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  {
    id: "card",
    name: "Card",
    enabled: true,
    simulatedStatus: "paid",
  },
  {
    id: "paynow",
    name: "PayNow",
    enabled: true,
    simulatedStatus: "paid",
  },
  {
    id: "bank_transfer",
    name: "Bank transfer",
    enabled: true,
    simulatedStatus: "awaiting_transfer",
  },
];

export function paymentMethod(id: PaymentMethodId): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((method) => method.id === id);
}

/**
 * Status a prototype checkout would store after the customer picks a method.
 * Bank transfer returns `"awaiting_transfer"`, never `"paid"`.
 * This does not contact a payment provider.
 */
export function paymentStatusAfterSimulation(methodId: PaymentMethodId): PaymentStatus {
  const method = paymentMethod(methodId);
  if (!method) return "unpaid";
  if (method.id === "bank_transfer") return "awaiting_transfer";
  return method.simulatedStatus;
}
