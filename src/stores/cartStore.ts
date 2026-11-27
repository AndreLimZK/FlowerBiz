"use client";

import { estimateCustomBouquet, priceCart } from "@/lib/pricing";
import { snapshotBouquetConfiguration } from "@/lib/snapshotBouquet";
import { commerceStateStorage } from "@/stores/persistStorage";
import { useCommerceStore } from "@/stores/commerceStore";
import type { BouquetConfiguration } from "@/types/bouquet";
import type { CartLine, CustomCartLine, ShopCartLine } from "@/types/commerce";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Cart lines for this browser. Shop lines point at the shop catalogue.
 * Each custom line has its own id and its own configuration snapshot.
 * Quantity changes apply to shop lines only.
 */

export type CartStore = {
  lines: CartLine[];
  addReadyMade: (productId: string, quantity?: number) => string | null;
  addCustomConfiguration: (configuration: BouquetConfiguration) => string | null;
  removeLine: (lineId: string) => void;
  /** Shop lines only. A custom line stays at quantity 1. */
  updateQuantity: (lineId: string, quantity: number) => void;
  /** Shop lines use the current catalogue. Custom lines use their frozen estimate. */
  subtotal: () => number;
  clear: () => void;
};

function newLineId(): string {
  return crypto.randomUUID();
}

function mergeCart(persisted: unknown, current: CartStore): CartStore {
  if (!persisted || typeof persisted !== "object") return current;
  const lines = (persisted as { lines?: unknown }).lines;
  if (!Array.isArray(lines)) return current;
  return { ...current, lines: lines.flatMap(restoreLine) };
}

function restoreLine(value: unknown): CartLine[] {
  if (!value || typeof value !== "object") return [];
  const line = value as Partial<CartLine>;
  if (line.kind === "shop") {
    if (typeof line.id !== "string" || typeof line.productId !== "string") return [];
    if (!Number.isInteger(line.quantity) || (line.quantity ?? 0) < 1) return [];
    const shop: ShopCartLine = {
      id: line.id,
      kind: "shop",
      productId: line.productId,
      quantity: line.quantity as number,
    };
    return [shop];
  }
  if (line.kind !== "custom" || typeof line.id !== "string") return [];
  const configuration = snapshotBouquetConfiguration(line.configuration as BouquetConfiguration);
  if (!configuration || typeof line.estimate !== "number" || !Number.isFinite(line.estimate)) return [];
  const custom: CustomCartLine = {
    id: line.id,
    kind: "custom",
    quantity: 1,
    title: "Custom bouquet",
    configuration,
    estimate: line.estimate,
    priceLabel: "Provisional estimate",
    provisional: true,
  };
  return [custom];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      lines: [],

      addReadyMade: (productId, quantity = 1) => {
        if (!Number.isInteger(quantity) || quantity < 1) return null;
        const product = useCommerceStore.getState().products.find((item) => item.id === productId);
        if (!product?.enabled || product.stock < 1) return null;

        const existing = get().lines.find((line) => line.kind === "shop" && line.productId === productId);
        if (existing && existing.kind === "shop") {
          const next = Math.min(product.stock, existing.quantity + quantity);
          if (next === existing.quantity) return existing.id;
          set({
            lines: get().lines.map((line) =>
              line.id === existing.id && line.kind === "shop" ? { ...line, quantity: next } : line,
            ),
          });
          return existing.id;
        }

        const line: ShopCartLine = {
          id: newLineId(),
          kind: "shop",
          productId,
          quantity: Math.min(product.stock, quantity),
        };
        set({ lines: [...get().lines, line] });
        return line.id;
      },

      addCustomConfiguration: (configuration) => {
        const snapshot = snapshotBouquetConfiguration(configuration);
        if (!snapshot) return null;
        const estimate = estimateCustomBouquet(snapshot);
        const line: CustomCartLine = {
          id: newLineId(),
          kind: "custom",
          quantity: 1,
          title: "Custom bouquet",
          configuration: snapshot,
          estimate: estimate.amount,
          priceLabel: estimate.label,
          provisional: true,
        };
        set({ lines: [...get().lines, line] });
        return line.id;
      },

      removeLine: (lineId) => {
        set({ lines: get().lines.filter((line) => line.id !== lineId) });
      },

      updateQuantity: (lineId, quantity) => {
        if (!Number.isInteger(quantity)) return;
        const line = get().lines.find((item) => item.id === lineId);
        if (!line || line.kind !== "shop") return;
        if (quantity < 1) {
          set({ lines: get().lines.filter((item) => item.id !== lineId) });
          return;
        }
        const product = useCommerceStore.getState().products.find((item) => item.id === line.productId);
        const next = product ? Math.min(quantity, product.stock) : quantity;
        if (next < 1) {
          set({ lines: get().lines.filter((item) => item.id !== lineId) });
          return;
        }
        if (next === line.quantity) return;
        set({
          lines: get().lines.map((item) =>
            item.id === lineId && item.kind === "shop" ? { ...item, quantity: next } : item,
          ),
        });
      },

      subtotal: () => priceCart(get().lines, useCommerceStore.getState().products).amount,

      clear: () => {
        set({ lines: [] });
      },
    }),
    {
      name: "flowerbiz-cart",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(commerceStateStorage),
      partialize: (state) => ({ lines: state.lines }),
      merge: mergeCart,
    },
  ),
);
