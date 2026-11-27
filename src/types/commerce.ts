import type { BouquetConfiguration } from "@/types/bouquet";

/**
 * Shop catalogue, cart, and prototype orders.
 * This is not `BouquetSubmission` in `src/types/order.ts`. That record is a
 * design-review submission. A shop order keeps `paymentStatus` and
 * `orderStatus` as separate fields.
 */

/** Placeholder label. Not a confirmed business price. */
export const CATALOGUE_PRICE_LABEL = "Catalogue placeholder";

/** Placeholder label. Not a confirmed business price. */
export const PROVISIONAL_ESTIMATE_LABEL = "Provisional estimate";

export type ShopProduct = {
  id: string;
  name: string;
  /** Placeholder amount. Not a confirmed business price. */
  price: number;
  stock: number;
  enabled: boolean;
  /** Short catalogue copy. Placeholder text. */
  summary: string;
  /** Text stand-in only. Not a photograph and not an image URL. */
  imageLabel: string;
};

export type ShopCartLine = {
  id: string;
  kind: "shop";
  productId: string;
  quantity: number;
};

export type CustomCartLine = {
  id: string;
  kind: "custom";
  quantity: 1;
  title: "Custom bouquet";
  /** Own snapshot for this line. Later edits in the editor do not change it. */
  configuration: BouquetConfiguration;
  /** Frozen placeholder amount for this snapshot. */
  estimate: number;
  priceLabel: typeof PROVISIONAL_ESTIMATE_LABEL;
  provisional: true;
};

export type CartLine = ShopCartLine | CustomCartLine;

export type ShopOrderLine = {
  id: string;
  kind: "shop";
  productId: string;
  name: string;
  /** Catalogue placeholder copied onto the order when it was seeded or placed. */
  unitPrice: number;
  quantity: number;
  priceLabel: typeof CATALOGUE_PRICE_LABEL;
};

export type CustomOrderLine = {
  id: string;
  kind: "custom";
  quantity: 1;
  title: "Custom bouquet";
  configuration: BouquetConfiguration;
  estimate: number;
  priceLabel: typeof PROVISIONAL_ESTIMATE_LABEL;
  provisional: true;
};

export type OrderLine = ShopOrderLine | CustomOrderLine;

/**
 * Design review, in order. Ready-made orders do not use these.
 */
export const DESIGN_REVIEW_STATUSES = [
  "pending_design_review",
  "changes_requested",
  "awaiting_customer_approval",
] as const;

export type DesignReviewStatus = (typeof DESIGN_REVIEW_STATUSES)[number];

/**
 * Shared fulfilment steps after design review.
 * `paid_confirmed` is an order step. It is not `paymentStatus`.
 */
export const SHARED_FULFILMENT_STATUSES = [
  "awaiting_payment",
  "paid_confirmed",
  "in_production",
] as const;

/**
 * Handoff step. An order uses one of these, from the delivery method.
 * They are not two steps that every order passes through.
 */
export const HANDOFF_STATUSES = ["ready_for_collection", "out_for_delivery"] as const;

export type HandoffStatus = (typeof HANDOFF_STATUSES)[number];

export const ORDER_STATUSES = [
  ...DESIGN_REVIEW_STATUSES,
  ...SHARED_FULFILMENT_STATUSES,
  ...HANDOFF_STATUSES,
  "completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Ready-made orders start at awaiting payment and skip design review. */
export const READY_MADE_ORDER_STATUSES = [
  ...SHARED_FULFILMENT_STATUSES,
  ...HANDOFF_STATUSES,
  "completed",
] as const;

export type ReadyMadeOrderStatus = (typeof READY_MADE_ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_design_review: "Pending design review",
  changes_requested: "Changes requested",
  awaiting_customer_approval: "Awaiting customer approval",
  awaiting_payment: "Awaiting payment",
  paid_confirmed: "Paid / confirmed",
  in_production: "In production",
  ready_for_collection: "Ready for collection",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
};

/**
 * Payment moves on its own. `"paid"` here is not the order step `"paid_confirmed"`.
 * Bank transfer uses `"awaiting_transfer"` and is not marked paid by the simulation.
 */
export const PAYMENT_STATUSES = ["unpaid", "awaiting_transfer", "paid", "failed"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  awaiting_transfer: "Awaiting transfer",
  paid: "Paid",
  failed: "Failed",
};

export const PAYMENT_METHOD_IDS = ["card", "paynow", "bank_transfer"] as const;

export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  enabled: boolean;
  /**
   * Prototype simulation only. No card number, wallet, or bank fields.
   * `bank_transfer` stays `"awaiting_transfer"` and is never `"paid"`.
   */
  simulatedStatus: PaymentStatus;
};

export const DELIVERY_METHOD_IDS = ["collect", "standard", "express"] as const;

export type DeliveryMethodId = (typeof DELIVERY_METHOD_IDS)[number];

export type DeliveryMethod = {
  id: DeliveryMethodId;
  name: string;
  /** Placeholder fee. Not a confirmed delivery rate. */
  fee: number;
  enabled: boolean;
  summary: string;
};

export type OrderWorkflow = "custom" | "ready_made";

export type CommerceOrder = {
  id: string;
  /** Custom when any line is a custom bouquet. Ready-made skips design review. */
  workflow: OrderWorkflow;
  lines: OrderLine[];
  customerName: string;
  customerEmail: string;
  deliveryMethodId: DeliveryMethodId;
  /** Placeholder fee copied from the delivery method. */
  deliveryFee: number;
  paymentMethodId: PaymentMethodId;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  /**
   * Line amounts plus the delivery placeholder.
   * When `includesProvisionalEstimate` is set, part of this figure is still a placeholder.
   */
  total: number;
  includesProvisionalEstimate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  methodId: PaymentMethodId;
  /** Placeholder amount. Not a charge or a receipt. */
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  prototypeNote: string;
};

export function isDesignReviewStatus(status: OrderStatus): status is DesignReviewStatus {
  return (DESIGN_REVIEW_STATUSES as readonly string[]).includes(status);
}

export function orderStatusesFor(workflow: OrderWorkflow): readonly OrderStatus[] {
  return workflow === "ready_made" ? READY_MADE_ORDER_STATUSES : ORDER_STATUSES;
}

export function isOrderStatusAllowed(workflow: OrderWorkflow, status: OrderStatus): boolean {
  return (orderStatusesFor(workflow) as readonly string[]).includes(status);
}

export function workflowForLines(lines: readonly { kind: string }[]): OrderWorkflow {
  return lines.some((line) => line.kind === "custom") ? "custom" : "ready_made";
}
