"use client";

import { SHOP_PRODUCTS } from "@/data/products";
import { useCommerceStore } from "@/stores/commerceStore";
import type { ShopProduct } from "@/types/commerce";

/**
 * The commerce store is the catalogue copy for this browser.
 * Optional placeholder fields that an older saved row does not have
 * are filled from the seed product with the same id.
 */
function presentShopProduct(product: ShopProduct): ShopProduct {
  const seed = SHOP_PRODUCTS.find((item) => item.id === product.id);
  if (!seed) return product;
  return {
    ...seed,
    ...product,
    category: product.category ?? seed.category,
    mockPopularity: product.mockPopularity ?? seed.mockPopularity,
    imageLabel: product.imageLabel || seed.imageLabel,
  };
}

export function useShopProducts(): ShopProduct[] {
  const products = useCommerceStore((state) => state.products);
  return products.map(presentShopProduct);
}
