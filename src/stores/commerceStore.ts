"use client";

import { DELIVERY_METHODS } from "@/data/delivery";
import { PAYMENT_METHODS } from "@/data/payments";
import { SHOP_PRODUCTS } from "@/data/products";
import { SEED_ORDERS, SEED_PAYMENTS } from "@/data/seedOrders";
import { commerceStateStorage } from "@/stores/persistStorage";
import type {
  CommerceOrder,
  DeliveryMethod,
  OrderStatus,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  ShopProduct,
} from "@/types/commerce";
import { isOrderStatusAllowed, PAYMENT_STATUSES } from "@/types/commerce";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Prototype orders, payments, and editable copies of the shop catalogue,
 * payment methods, and delivery methods. Seeded for this browser only.
 * Changing `paymentStatus` does not change `orderStatus`, and the reverse.
 */

type ProductInfo = Partial<Pick<ShopProduct, "name" | "summary" | "price" | "stock" | "enabled">>;

type DeliveryInfo = Partial<Pick<DeliveryMethod, "name" | "summary" | "fee" | "enabled">>;

export type CommerceStore = {
  products: ShopProduct[];
  paymentMethods: PaymentMethod[];
  deliveryMethods: DeliveryMethod[];
  orders: CommerceOrder[];
  payments: PaymentRecord[];
  updateOrderStatus: (orderId: string, orderStatus: OrderStatus) => void;
  updatePaymentStatus: (paymentId: string, paymentStatus: PaymentStatus) => void;
  updateProduct: (productId: string, patch: ProductInfo) => void;
  setProductAvailability: (productId: string, enabled: boolean) => void;
  setPaymentMethodEnabled: (methodId: string, enabled: boolean) => void;
  updateDeliveryMethod: (methodId: string, patch: DeliveryInfo) => void;
};

function now(): string {
  return new Date().toISOString();
}

function cloneProducts(): ShopProduct[] {
  return SHOP_PRODUCTS.map((product) => ({ ...product }));
}

function clonePaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS.map((method) => ({ ...method }));
}

function cloneDeliveryMethods(): DeliveryMethod[] {
  return DELIVERY_METHODS.map((method) => ({ ...method }));
}

function cloneOrders(): CommerceOrder[] {
  return SEED_ORDERS.map((order) => structuredClone(order));
}

function clonePayments(): PaymentRecord[] {
  return SEED_PAYMENTS.map((payment) => ({ ...payment }));
}

function initialCommerce(): Pick<
  CommerceStore,
  "products" | "paymentMethods" | "deliveryMethods" | "orders" | "payments"
> {
  return {
    products: cloneProducts(),
    paymentMethods: clonePaymentMethods(),
    deliveryMethods: cloneDeliveryMethods(),
    orders: cloneOrders(),
    payments: clonePayments(),
  };
}

function isFinitePrice(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function mergeCommerce(persisted: unknown, current: CommerceStore): CommerceStore {
  if (!persisted || typeof persisted !== "object") return current;
  const data = persisted as Partial<CommerceStore>;
  return {
    ...current,
    products: Array.isArray(data.products) ? data.products : current.products,
    paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : current.paymentMethods,
    deliveryMethods: Array.isArray(data.deliveryMethods) ? data.deliveryMethods : current.deliveryMethods,
    orders: Array.isArray(data.orders) ? data.orders : current.orders,
    payments: Array.isArray(data.payments) ? data.payments : current.payments,
  };
}

export const useCommerceStore = create<CommerceStore>()(
  persist(
    (set) => ({
      ...initialCommerce(),

      updateOrderStatus: (orderId, orderStatus) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            if (!isOrderStatusAllowed(order.workflow, orderStatus)) return order;
            if (order.orderStatus === orderStatus) return order;
            return { ...order, orderStatus, updatedAt: now() };
          }),
        }));
      },

      updatePaymentStatus: (paymentId, paymentStatus) => {
        if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return;
        set((state) => {
          const payment = state.payments.find((item) => item.id === paymentId);
          if (!payment || payment.status === paymentStatus) return state;
          const updatedAt = now();
          return {
            payments: state.payments.map((item) =>
              item.id === paymentId ? { ...item, status: paymentStatus, updatedAt } : item,
            ),
            orders: state.orders.map((order) =>
              order.id === payment.orderId ? { ...order, paymentStatus, updatedAt } : order,
            ),
          };
        });
      },

      updateProduct: (productId, patch) => {
        if (patch.price !== undefined && !isFinitePrice(patch.price)) return;
        if (patch.stock !== undefined && (!Number.isInteger(patch.stock) || patch.stock < 0)) return;
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== productId) return product;
            return {
              ...product,
              ...(typeof patch.name === "string" ? { name: patch.name } : {}),
              ...(typeof patch.summary === "string" ? { summary: patch.summary } : {}),
              ...(patch.price !== undefined ? { price: patch.price } : {}),
              ...(patch.stock !== undefined ? { stock: patch.stock } : {}),
              ...(typeof patch.enabled === "boolean" ? { enabled: patch.enabled } : {}),
            };
          }),
        }));
      },

      setProductAvailability: (productId, enabled) => {
        if (typeof enabled !== "boolean") return;
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId ? { ...product, enabled } : product,
          ),
        }));
      },

      setPaymentMethodEnabled: (methodId, enabled) => {
        if (typeof enabled !== "boolean") return;
        set((state) => ({
          paymentMethods: state.paymentMethods.map((method) =>
            method.id === methodId ? { ...method, enabled } : method,
          ),
        }));
      },

      updateDeliveryMethod: (methodId, patch) => {
        if (patch.fee !== undefined && !isFinitePrice(patch.fee)) return;
        set((state) => ({
          deliveryMethods: state.deliveryMethods.map((method) => {
            if (method.id !== methodId) return method;
            return {
              ...method,
              ...(typeof patch.name === "string" ? { name: patch.name } : {}),
              ...(typeof patch.summary === "string" ? { summary: patch.summary } : {}),
              ...(patch.fee !== undefined ? { fee: patch.fee } : {}),
              ...(typeof patch.enabled === "boolean" ? { enabled: patch.enabled } : {}),
            };
          }),
        }));
      },
    }),
    {
      name: "flowerbiz-commerce",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(commerceStateStorage),
      partialize: (state) => ({
        products: state.products,
        paymentMethods: state.paymentMethods,
        deliveryMethods: state.deliveryMethods,
        orders: state.orders,
        payments: state.payments,
      }),
      merge: mergeCommerce,
    },
  ),
);
