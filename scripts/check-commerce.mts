import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { paymentStatusAfterSimulation } from "@/data/payments";
import { SHOP_PRODUCTS } from "@/data/products";
import { SEED_ORDERS, SEED_PAYMENTS } from "@/data/seedOrders";
import {
  PROVISIONAL_ASSEMBLY_FEE,
  PROVISIONAL_PRICE_PER_FLOWER,
  estimateCustomBouquet,
  priceCart,
} from "@/lib/pricing";
import { snapshotBouquetConfiguration } from "@/lib/snapshotBouquet";
import { useCartStore } from "@/stores/cartStore";
import { useCommerceStore } from "@/stores/commerceStore";
import type { BouquetConfiguration } from "@/types/bouquet";
import { PROVISIONAL_ESTIMATE_LABEL } from "@/types/commerce";

function configuration(): BouquetConfiguration {
  return {
    schemaVersion: 1,
    flowers: [
      {
        instanceId: "check-rose",
        productId: "dev-rose",
        colourId: "dev-rose-blush",
        position: { x: 0.1, y: 0, z: -0.05 },
        rotation: { x: 0, y: 0.2, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    ],
    wrappingId: "dev-wrap-kraft",
    stemOptionId: "dev-stem-short",
    ribbonId: "dev-ribbon-cotton",
    createdAt: "2026-11-27T02:00:00.000Z",
    updatedAt: "2026-11-27T02:00:00.000Z",
  };
}

const pricingSource = readFileSync(new URL("../src/lib/pricing.ts", import.meta.url), "utf8");
const productsSource = readFileSync(new URL("../src/data/products.ts", import.meta.url), "utf8");
assert.equal(pricingSource.includes("basePrice"), false);
assert.equal(/from ["']@\/data\/flowers["']/.test(pricingSource), false);
assert.equal(/from ["']@\/data\/flowers["']/.test(productsSource), false);
assert.equal(productsSource.includes("Not a photograph"), true);

assert.equal(useCartStore.persist.getOptions().skipHydration, true);
assert.equal(useCommerceStore.persist.getOptions().skipHydration, true);
assert.equal(useCartStore.persist.hasHydrated(), false);
assert.equal(useCommerceStore.persist.hasHydrated(), false);

const current = configuration();
const withHistory = {
  ...current,
  past: [configuration()],
  future: [configuration()],
  selectedInstanceId: "not-a-flower",
  transformGesture: configuration(),
  object3d: { type: "Mesh" },
};

const first = snapshotBouquetConfiguration(withHistory);
const second = snapshotBouquetConfiguration(configuration());
assert.ok(first);
assert.ok(second);
assert.equal("past" in first, false);
assert.equal("future" in first, false);
assert.equal("selectedInstanceId" in first, false);
assert.equal("transformGesture" in first, false);
assert.equal("object3d" in first, false);
assert.equal(JSON.stringify(first).includes("transformGesture"), false);
assert.equal(JSON.stringify(first).includes("selectedInstanceId"), false);
assert.deepEqual(Object.keys(first.flowers[0]).sort(), [
  "colourId",
  "instanceId",
  "position",
  "productId",
  "rotation",
  "scale",
]);
assert.notEqual(first, second);
assert.notEqual(first.flowers, second.flowers);

current.flowers[0].position.x = 9;
assert.notEqual(first.flowers[0].position.x, 9);

const empty = snapshotBouquetConfiguration({ ...configuration(), flowers: [] });
assert.equal(empty, null);

const estimate = estimateCustomBouquet(first);
assert.equal(estimate.provisional, true);
assert.equal(estimate.label, PROVISIONAL_ESTIMATE_LABEL);
assert.equal(estimate.label, "Provisional estimate");
assert.equal(estimate.amount, PROVISIONAL_ASSEMBLY_FEE + PROVISIONAL_PRICE_PER_FLOWER);

useCartStore.getState().clear();
assert.equal(useCartStore.getState().addCustomConfiguration({ ...configuration(), flowers: [] }), null);
assert.equal(useCartStore.getState().lines.length, 0);

const left = configuration();
const right = configuration();
right.flowers = [
  {
    ...right.flowers[0],
    instanceId: "check-daisy",
    position: { x: -0.1, y: 0, z: 0.05 },
  },
];
const leftId = useCartStore.getState().addCustomConfiguration(left);
const leftAgain = useCartStore.getState().addCustomConfiguration(left);
const rightId = useCartStore.getState().addCustomConfiguration(right);
assert.ok(leftId);
assert.ok(leftAgain);
assert.ok(rightId);
assert.notEqual(leftId, leftAgain);
assert.notEqual(leftId, rightId);

const customLines = useCartStore.getState().lines.filter((line) => line.kind === "custom");
assert.equal(customLines.length, 3);
assert.equal(customLines[0].id, leftId);
assert.equal(customLines[1].id, leftAgain);
assert.equal(customLines[2].id, rightId);
assert.equal(customLines[0].quantity, 1);
assert.equal(customLines[0].provisional, true);
assert.equal(customLines[0].priceLabel, "Provisional estimate");
assert.notEqual(customLines[0].configuration, customLines[1].configuration);
assert.notEqual(customLines[0].configuration, customLines[2].configuration);

left.flowers[0].position.y = 3;
assert.notEqual(customLines[0].configuration.flowers[0].position.y, 3);
customLines[0].configuration.flowers[0].position.x = 4;
assert.notEqual(customLines[1].configuration.flowers[0].position.x, 4);
assert.notEqual(customLines[2].configuration.flowers[0].position.x, 4);

useCartStore.getState().updateQuantity(leftId, 5);
const afterQuantity = useCartStore.getState().lines.find((line) => line.id === leftId);
assert.ok(afterQuantity && afterQuantity.kind === "custom");
assert.equal(afterQuantity.quantity, 1);

const priced = priceCart(useCartStore.getState().lines, useCommerceStore.getState().products);
assert.equal(priced.includesProvisionalEstimate, true);
assert.equal(
  priced.lines.every((line) => line.label === "Provisional estimate" && line.provisional),
  true,
);

const blush = SHOP_PRODUCTS.find((product) => product.id === "shop-blush-bunch");
assert.ok(blush);
useCartStore.getState().clear();
const shopId = useCartStore.getState().addReadyMade(blush.id, 2);
assert.ok(shopId);
assert.equal(useCartStore.getState().subtotal(), blush.price * 2);
useCommerceStore.getState().updateProduct(blush.id, { price: 10 });
assert.equal(useCartStore.getState().subtotal(), 20);
useCommerceStore.getState().updateProduct(blush.id, { price: blush.price });

assert.equal(useCartStore.getState().addReadyMade("shop-sage-wrap", 1), null);
assert.equal(useCartStore.getState().addReadyMade("shop-ink-ribbon", 1), null);

const simulated = paymentStatusAfterSimulation("bank_transfer");
assert.notEqual(simulated, "paid");
assert.equal(simulated, "awaiting_transfer");
const transfer = SEED_PAYMENTS.find((payment) => payment.methodId === "bank_transfer");
const transferOrder = SEED_ORDERS.find((order) => order.paymentMethodId === "bank_transfer");
assert.ok(transfer);
assert.ok(transferOrder);
assert.notEqual(transfer.status, "paid");
assert.equal(transfer.status, simulated);
assert.equal(transferOrder.paymentStatus, simulated);
assert.equal(transferOrder.orderStatus, "awaiting_payment");
assert.notEqual(transferOrder.orderStatus, "paid_confirmed");

const readyMade = useCommerceStore.getState().orders.find((order) => order.id === "seed-order-ready-made");
assert.ok(readyMade);
assert.equal(readyMade.workflow, "ready_made");
assert.equal(readyMade.paymentStatus, "paid");
assert.equal(readyMade.orderStatus, "in_production");
const readyMadeStatus = readyMade.orderStatus;
useCommerceStore.getState().updateOrderStatus(readyMade.id, "pending_design_review");
const readyMadeAfter = useCommerceStore.getState().orders.find((order) => order.id === readyMade.id);
assert.ok(readyMadeAfter);
assert.equal(readyMadeAfter.orderStatus, readyMadeStatus);
assert.equal(readyMadeAfter.paymentStatus, "paid");

const customOrder = useCommerceStore.getState().orders.find((order) => order.id === "seed-order-custom-review");
assert.ok(customOrder);
assert.equal(customOrder.orderStatus, "pending_design_review");
assert.equal(customOrder.paymentStatus, "unpaid");
assert.equal(customOrder.includesProvisionalEstimate, true);

console.log("commerce check ok", {
  customLineIds: [leftId, leftAgain, rightId],
  estimate: estimate.amount,
  bankTransfer: simulated,
});
