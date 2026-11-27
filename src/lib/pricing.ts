import type {
  CartLine,
  CustomCartLine,
  OrderLine,
  ShopProduct,
} from "@/types/commerce";
import { CATALOGUE_PRICE_LABEL, PROVISIONAL_ESTIMATE_LABEL } from "@/types/commerce";
import type { BouquetConfiguration } from "@/types/bouquet";

/**
 * The only price functions for shop lines and custom bouquets.
 * Shop lines use the shop catalogue amount.
 * A custom bouquet uses a placeholder assembly fee plus a per-flower placeholder.
 * Both are prototype figures, not confirmed business prices.
 */

/** Placeholder assembly amount added once per custom bouquet. */
export const PROVISIONAL_ASSEMBLY_FEE = 28;

/** Placeholder amount counted once per placed flower on a custom bouquet. */
export const PROVISIONAL_PRICE_PER_FLOWER = 8;

export type ProvisionalEstimate = {
  amount: number;
  label: typeof PROVISIONAL_ESTIMATE_LABEL;
  provisional: true;
  flowerCount: number;
  assemblyFee: number;
  perFlower: number;
};

export type PricedCartLine = {
  id: string;
  amount: number;
  label: typeof CATALOGUE_PRICE_LABEL | typeof PROVISIONAL_ESTIMATE_LABEL;
  provisional: boolean;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function estimateCustomBouquet(configuration: BouquetConfiguration): ProvisionalEstimate {
  const flowerCount = configuration.flowers.length;
  return {
    amount: roundMoney(PROVISIONAL_ASSEMBLY_FEE + flowerCount * PROVISIONAL_PRICE_PER_FLOWER),
    label: PROVISIONAL_ESTIMATE_LABEL,
    provisional: true,
    flowerCount,
    assemblyFee: PROVISIONAL_ASSEMBLY_FEE,
    perFlower: PROVISIONAL_PRICE_PER_FLOWER,
  };
}

export function catalogueUnitPrice(products: readonly ShopProduct[], productId: string): number | null {
  const product = products.find((item) => item.id === productId);
  if (!product || !Number.isFinite(product.price)) return null;
  return product.price;
}

export function priceCart(lines: readonly CartLine[], products: readonly ShopProduct[]): {
  amount: number;
  lines: PricedCartLine[];
  includesProvisionalEstimate: boolean;
} {
  const priced: PricedCartLine[] = [];
  let amount = 0;
  let includesProvisionalEstimate = false;

  for (const line of lines) {
    if (line.kind === "shop") {
      const unit = catalogueUnitPrice(products, line.productId);
      const lineAmount = unit === null ? 0 : roundMoney(unit * line.quantity);
      amount += lineAmount;
      priced.push({
        id: line.id,
        amount: lineAmount,
        label: CATALOGUE_PRICE_LABEL,
        provisional: false,
      });
      continue;
    }

    const custom: CustomCartLine = line;
    amount += custom.estimate;
    includesProvisionalEstimate = true;
    priced.push({
      id: custom.id,
      amount: custom.estimate,
      label: custom.priceLabel,
      provisional: true,
    });
  }

  return { amount: roundMoney(amount), lines: priced, includesProvisionalEstimate };
}

export function priceOrder(lines: readonly OrderLine[], deliveryFee: number): {
  amount: number;
  includesProvisionalEstimate: boolean;
} {
  let amount = Number.isFinite(deliveryFee) ? deliveryFee : 0;
  let includesProvisionalEstimate = false;

  for (const line of lines) {
    if (line.kind === "shop") {
      amount += line.unitPrice * line.quantity;
      continue;
    }
    amount += line.estimate;
    includesProvisionalEstimate = true;
  }

  return { amount: roundMoney(amount), includesProvisionalEstimate };
}
