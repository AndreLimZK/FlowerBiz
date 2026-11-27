import type { ShopProduct } from "@/types/commerce";

/**
 * SHOP PLACEHOLDERS.
 * Ready-made bouquets for the shop catalogue. Not `DEV_FLOWER_PRODUCTS`.
 * Prices are stand-in amounts, not confirmed business prices.
 * `imageLabel` is text. It is not a photograph and not a picture URL.
 */
export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  {
    id: "shop-blush-bunch",
    name: "Blush bunch",
    price: 48,
    stock: 6,
    enabled: true,
    summary: "Placeholder ready-made bouquet. The business has not confirmed this product.",
    imageLabel: "Placeholder swatch. Not a photograph.",
  },
  {
    id: "shop-cream-posy",
    name: "Cream posy",
    price: 36,
    stock: 4,
    enabled: true,
    summary: "Placeholder ready-made bouquet. The business has not confirmed this product.",
    imageLabel: "Placeholder swatch. Not a photograph.",
  },
  {
    id: "shop-sage-wrap",
    name: "Sage wrap",
    price: 54,
    stock: 0,
    enabled: true,
    summary: "Placeholder ready-made bouquet with no placeholder stock.",
    imageLabel: "Placeholder swatch. Not a photograph.",
  },
  {
    id: "shop-ink-ribbon",
    name: "Ink ribbon",
    price: 42,
    stock: 3,
    enabled: false,
    summary: "Placeholder ready-made bouquet, switched off in the prototype catalogue.",
    imageLabel: "Placeholder swatch. Not a photograph.",
  },
];

export function shopProduct(productId: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((product) => product.id === productId);
}
