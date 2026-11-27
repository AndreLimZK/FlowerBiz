"use client";

import { ProductCard } from "@/components/site/ProductCard";
import { useShopProducts } from "@/components/shop/useShopProducts";

export function FeaturedProducts() {
  const products = useShopProducts().filter((product) => product.enabled);

  if (products.length === 0) {
    return <p className="mt-8 text-sm text-muted">No enabled placeholder products are in the catalogue.</p>;
  }

  return (
    <ul className="mt-8 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
