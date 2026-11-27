import type { CartLine, ShopProduct } from "@/types/commerce";

/**
 * Read-only helpers for the shop pages.
 * Prices stay the catalogue placeholders from `ShopProduct.price`.
 */

export type ShopSort = "catalogue" | "price-asc" | "price-desc" | "mock-popularity";

export function cartItemCount(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function quantityInCart(lines: readonly CartLine[], productId: string): number {
  return lines.reduce((total, line) => {
    if (line.kind === "shop" && line.productId === productId) return total + line.quantity;
    return total;
  }, 0);
}

export function shopCategory(product: ShopProduct): string {
  return product.category?.trim() || "Uncategorised";
}

export function shopCategories(products: readonly ShopProduct[]): string[] {
  return [...new Set(products.map(shopCategory))].sort((left, right) => left.localeCompare(right));
}

export function filterShopProducts(
  products: readonly ShopProduct[],
  query: string,
  category: string,
): ShopProduct[] {
  const needle = query.trim().toLowerCase();
  return products.filter((product) => {
    if (category !== "all" && shopCategory(product) !== category) return false;
    if (!needle) return true;
    const haystack = [product.name, product.summary, shopCategory(product)].join(" ").toLowerCase();
    return haystack.includes(needle);
  });
}

export function sortShopProducts(products: readonly ShopProduct[], sort: ShopSort): ShopProduct[] {
  const next = [...products];
  if (sort === "price-asc") {
    next.sort((left, right) => left.price - right.price || left.name.localeCompare(right.name));
  } else if (sort === "price-desc") {
    next.sort((left, right) => right.price - left.price || left.name.localeCompare(right.name));
  } else if (sort === "mock-popularity") {
    next.sort(
      (left, right) =>
        (right.mockPopularity ?? Number.NEGATIVE_INFINITY) - (left.mockPopularity ?? Number.NEGATIVE_INFINITY) ||
        left.name.localeCompare(right.name),
    );
  }
  return next;
}

export function relatedProducts(products: readonly ShopProduct[], product: ShopProduct): ShopProduct[] {
  const others = products.filter((item) => item.id !== product.id);
  const sameCategory = others.filter((item) => shopCategory(item) === shopCategory(product));
  const rest = others.filter((item) => shopCategory(item) !== shopCategory(product));
  return [...sameCategory, ...rest].slice(0, 3);
}

export function canAddReadyMade(product: ShopProduct, alreadyInCart = 0): boolean {
  if (!product.enabled || product.stock < 1) return false;
  return product.stock - alreadyInCart > 0;
}

export function availabilityLabel(product: ShopProduct): string {
  if (!product.enabled) return "Disabled in this prototype";
  if (product.stock < 1) return "Unavailable";
  return `Available · placeholder stock ${product.stock}`;
}

export function formatCatalogueAmount(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
