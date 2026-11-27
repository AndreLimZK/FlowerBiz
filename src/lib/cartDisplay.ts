import { devColourName, devFlowerProduct } from "@/data/flowers";
import {
  DEV_RIBBON_OPTIONS,
  DEV_STEM_OPTIONS,
  DEV_WRAPPING_OPTIONS,
  type DevBouquetOption,
} from "@/data/options";
import { catalogueUnitPrice } from "@/lib/pricing";
import type { BouquetConfiguration } from "@/types/bouquet";
import type { ShopCartLine, ShopProduct } from "@/types/commerce";

/**
 * Labels for a frozen custom-bouquet snapshot.
 * Names come from the dev option lists. An id that is not in those lists
 * stays unresolved so the cart does not invent a label.
 */

export type ResolvedOption = {
  id: string;
  label: string | null;
};

export type CustomFlowerType = {
  key: string;
  name: string;
  colour: string | null;
  count: number;
};

export type CustomBouquetDetails = {
  flowerCount: number;
  types: CustomFlowerType[];
  wrapping: ResolvedOption;
  stem: ResolvedOption;
  ribbon: ResolvedOption;
};

function resolveOption(options: readonly DevBouquetOption[], id: string): ResolvedOption {
  const match = options.find((option) => option.id === id);
  return { id, label: match?.name ?? null };
}

export function describeCustomBouquet(configuration: BouquetConfiguration): CustomBouquetDetails {
  const types: CustomFlowerType[] = [];
  for (const flower of configuration.flowers) {
    const key = `${flower.productId}\u0000${flower.colourId}`;
    const existing = types.find((type) => type.key === key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    types.push({
      key,
      name: devFlowerProduct(flower.productId)?.name ?? flower.productId,
      colour: devColourName(flower.colourId) ?? null,
      count: 1,
    });
  }

  return {
    flowerCount: configuration.flowers.length,
    types,
    wrapping: resolveOption(DEV_WRAPPING_OPTIONS, configuration.wrappingId),
    stem: resolveOption(DEV_STEM_OPTIONS, configuration.stemOptionId),
    ribbon: resolveOption(DEV_RIBBON_OPTIONS, configuration.ribbonId),
  };
}

export type ShopLineAvailability = "ready" | "at-stock" | "over-stock" | "disabled" | "unavailable" | "missing";

export type ShopLineAvailabilityView = {
  availability: ShopLineAvailability;
  product: ShopProduct | null;
  unitPrice: number | null;
  canIncrease: boolean;
  /** Stepper maximum. The current quantity when an increase is refused. */
  maxQuantity: number;
};

export function shopLineAvailability(
  products: readonly ShopProduct[],
  line: ShopCartLine,
): ShopLineAvailabilityView {
  const product = products.find((item) => item.id === line.productId) ?? null;
  if (!product) {
    return {
      availability: "missing",
      product: null,
      unitPrice: null,
      canIncrease: false,
      maxQuantity: line.quantity,
    };
  }

  const unitPrice = catalogueUnitPrice(products, line.productId);
  if (!product.enabled) {
    return {
      availability: "disabled",
      product,
      unitPrice,
      canIncrease: false,
      maxQuantity: line.quantity,
    };
  }
  if (product.stock < 1) {
    return {
      availability: "unavailable",
      product,
      unitPrice,
      canIncrease: false,
      maxQuantity: line.quantity,
    };
  }
  if (line.quantity > product.stock) {
    return {
      availability: "over-stock",
      product,
      unitPrice,
      canIncrease: false,
      maxQuantity: line.quantity,
    };
  }
  if (line.quantity >= product.stock) {
    return {
      availability: "at-stock",
      product,
      unitPrice,
      canIncrease: false,
      maxQuantity: product.stock,
    };
  }
  return {
    availability: "ready",
    product,
    unitPrice,
    canIncrease: true,
    maxQuantity: product.stock,
  };
}
