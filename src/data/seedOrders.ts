import { deliveryMethod } from "@/data/delivery";
import { paymentStatusAfterSimulation } from "@/data/payments";
import { shopProduct } from "@/data/products";
import { priceOrder } from "@/lib/pricing";
import { estimateCustomBouquet } from "@/lib/pricing";
import type { BouquetConfiguration } from "@/types/bouquet";
import type { CommerceOrder, PaymentRecord } from "@/types/commerce";

/**
 * SEED ORDERS.
 * A few prototype rows so later tracking and admin screens have something to read.
 * They live in this browser only. They are not shared business records.
 * One custom order is still in design review. Ready-made orders skip those steps.
 * The bank-transfer row stays unpaid.
 */

const SEEDED_AT = "2026-11-20T02:00:00.000Z";

const seedCustomConfiguration: BouquetConfiguration = {
  schemaVersion: 1,
  flowers: [
    {
      instanceId: "seed-custom-rose",
      productId: "dev-rose",
      colourId: "dev-rose-blush",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
  ],
  wrappingId: "dev-wrap-kraft",
  stemOptionId: "dev-stem-short",
  ribbonId: "dev-ribbon-cotton",
  createdAt: SEEDED_AT,
  updatedAt: SEEDED_AT,
};

const customEstimate = estimateCustomBouquet(seedCustomConfiguration);
const standardDelivery = deliveryMethod("standard");
const collectDelivery = deliveryMethod("collect");
const blush = shopProduct("shop-blush-bunch");
const cream = shopProduct("shop-cream-posy");

if (!standardDelivery || !collectDelivery || !blush || !cream) {
  throw new Error("Seed orders are missing a placeholder product or delivery method.");
}

const customLines = [
  {
    id: "seed-line-custom-review",
    kind: "custom" as const,
    quantity: 1 as const,
    title: "Custom bouquet" as const,
    configuration: seedCustomConfiguration,
    estimate: customEstimate.amount,
    priceLabel: customEstimate.label,
    provisional: true as const,
  },
];

const readyMadeLines = [
  {
    id: "seed-line-blush",
    kind: "shop" as const,
    productId: blush.id,
    name: blush.name,
    unitPrice: blush.price,
    quantity: 1,
    priceLabel: "Catalogue placeholder" as const,
  },
];

const transferLines = [
  {
    id: "seed-line-cream",
    kind: "shop" as const,
    productId: cream.id,
    name: cream.name,
    unitPrice: cream.price,
    quantity: 2,
    priceLabel: "Catalogue placeholder" as const,
  },
];

const customTotal = priceOrder(customLines, standardDelivery.fee);
const readyMadeTotal = priceOrder(readyMadeLines, collectDelivery.fee);
const transferTotal = priceOrder(transferLines, standardDelivery.fee);
const transferStatus = paymentStatusAfterSimulation("bank_transfer");

export const SEED_ORDERS: readonly CommerceOrder[] = [
  {
    id: "seed-order-custom-review",
    workflow: "custom",
    lines: customLines,
    customerName: "Placeholder customer",
    customerEmail: "custom-review@example.com",
    deliveryMethodId: "standard",
    deliveryFee: standardDelivery.fee,
    paymentMethodId: "card",
    paymentStatus: "unpaid",
    orderStatus: "pending_design_review",
    total: customTotal.amount,
    includesProvisionalEstimate: customTotal.includesProvisionalEstimate,
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "seed-order-ready-made",
    workflow: "ready_made",
    lines: readyMadeLines,
    customerName: "Placeholder customer",
    customerEmail: "ready-made@example.com",
    deliveryMethodId: "collect",
    deliveryFee: collectDelivery.fee,
    paymentMethodId: "paynow",
    paymentStatus: "paid",
    orderStatus: "in_production",
    total: readyMadeTotal.amount,
    includesProvisionalEstimate: readyMadeTotal.includesProvisionalEstimate,
    createdAt: "2026-11-21T02:00:00.000Z",
    updatedAt: "2026-11-21T02:00:00.000Z",
  },
  {
    id: "seed-order-bank-transfer",
    workflow: "ready_made",
    lines: transferLines,
    customerName: "Placeholder customer",
    customerEmail: "transfer@example.com",
    deliveryMethodId: "standard",
    deliveryFee: standardDelivery.fee,
    paymentMethodId: "bank_transfer",
    paymentStatus: transferStatus,
    orderStatus: "awaiting_payment",
    total: transferTotal.amount,
    includesProvisionalEstimate: transferTotal.includesProvisionalEstimate,
    createdAt: "2026-11-22T02:00:00.000Z",
    updatedAt: "2026-11-22T02:00:00.000Z",
  },
];

export const SEED_PAYMENTS: readonly PaymentRecord[] = [
  {
    id: "seed-payment-custom-review",
    orderId: "seed-order-custom-review",
    methodId: "card",
    amount: customTotal.amount,
    status: "unpaid",
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
    prototypeNote: "Prototype record. Not a charge. Design review has not reached payment.",
  },
  {
    id: "seed-payment-ready-made",
    orderId: "seed-order-ready-made",
    methodId: "paynow",
    amount: readyMadeTotal.amount,
    status: "paid",
    createdAt: "2026-11-21T02:00:00.000Z",
    updatedAt: "2026-11-21T02:00:00.000Z",
    prototypeNote: "Prototype record. Simulated PayNow success. Not a charge.",
  },
  {
    id: "seed-payment-bank-transfer",
    orderId: "seed-order-bank-transfer",
    methodId: "bank_transfer",
    amount: transferTotal.amount,
    status: transferStatus,
    createdAt: "2026-11-22T02:00:00.000Z",
    updatedAt: "2026-11-22T02:00:00.000Z",
    prototypeNote: "Prototype record. Bank transfer is waiting. It is not marked paid and it is not a charge.",
  },
];
