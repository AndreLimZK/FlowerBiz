"use client";

import { EmptyState } from "@/components/site/EmptyState";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductPlaceholder } from "@/components/site/ProductPlaceholder";
import { ProvisionalPrice } from "@/components/site/ProvisionalPrice";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { eyebrowClass, pillButtonClass, pillGhostClass, textLinkClass } from "@/components/site/classes";
import { useShopProducts } from "@/components/shop/useShopProducts";
import {
  availabilityLabel,
  canAddReadyMade,
  cartItemCount,
  quantityInCart,
  relatedProducts,
  shopCategory,
} from "@/lib/shopCatalogue";
import { useCartStore } from "@/stores/cartStore";
import type { ShopProduct } from "@/types/commerce";
import Link from "next/link";
import { useState } from "react";

export function ProductDetail({ productId }: { productId: string }) {
  const products = useShopProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return <ProductNotFound productId={productId} />;
  }

  return (
    <ProductPurchase key={product.id} product={product} related={relatedProducts(products, product)} />
  );
}

function ProductNotFound({ productId }: { productId: string }) {
  return (
    <div>
      <p className="mb-8 text-sm">
        <Link href="/shop" className={textLinkClass}>
          Shop
        </Link>
      </p>
      <EmptyState
        title="This product is not in the catalogue"
        titleAs="h1"
        action={
          <Link href="/shop" className={pillButtonClass}>
            Back to the shop
          </Link>
        }
      >
        <span className="break-all">There is no placeholder product with the id “{productId}”.</span>
      </EmptyState>
    </div>
  );
}

function ProductPurchase({ product, related }: { product: ShopProduct; related: ShopProduct[] }) {
  const lines = useCartStore((state) => state.lines);
  const addReadyMade = useCartStore((state) => state.addReadyMade);
  const inCart = quantityInCart(lines, product.id);
  const remaining = Math.max(0, product.stock - inCart);
  const canAdd = canAddReadyMade(product, inCart);
  const [requested, setRequested] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const quantity = !canAdd ? 1 : Math.min(Math.max(requested, 1), remaining);
  const areas = [1, 2, 3];

  function onAdd() {
    if (!canAdd) {
      if (!product.enabled) setNotice("Disabled products cannot be added to the cart.");
      else if (product.stock < 1) setNotice("Unavailable products cannot be added to the cart.");
      else setNotice("Your cart already holds the placeholder stock for this product.");
      return;
    }
    const before = quantityInCart(useCartStore.getState().lines, product.id);
    const lineId = addReadyMade(product.id, quantity);
    const afterLines = useCartStore.getState().lines;
    const after = quantityInCart(afterLines, product.id);
    const added = after - before;
    if (!lineId || added < 1) {
      setNotice("Nothing was added. This product is unavailable, or the cart already holds the placeholder stock.");
      return;
    }
    setNotice(`Added ${added}. Cart count is now ${cartItemCount(afterLines)}.`);
    setRequested(1);
  }

  return (
    <div>
      <p className="text-sm">
        <Link href="/shop" className={textLinkClass}>
          Shop
        </Link>
      </p>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="grid gap-3">
            <ProductPlaceholder productId={product.id} label={`${product.imageLabel} Area 1.`} className="h-72 sm:h-96" />
            <div className="grid grid-cols-2 gap-3">
              {areas.slice(1).map((area) => (
                <ProductPlaceholder
                  key={area}
                  productId={product.id}
                  label={`${product.imageLabel} Area ${area}.`}
                  className="h-28"
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            These areas are placeholders. They are not product photographs.
          </p>
        </div>
        <div>
          <p className={eyebrowClass}>Placeholder category · {shopCategory(product)}</p>
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] text-ink md:text-5xl">{product.name}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{product.summary}</p>
          <div className="mt-8">
            <ProvisionalPrice amount={product.price} />
          </div>
          {typeof product.mockPopularity === "number" ? (
            <p className="mt-4 text-sm text-muted">Mock popularity {product.mockPopularity}. Not sales data.</p>
          ) : null}
          <p className="mt-6 text-sm text-ink">{availabilityLabel(product)}</p>
          {product.enabled && product.stock > 0 ? (
            <p className="mt-2 text-sm text-muted">
              Placeholder stock {product.stock}. Already in this cart: {inCart}.
            </p>
          ) : null}
          {!product.enabled ? (
            <p className="mt-2 text-sm text-muted">Disabled products cannot be added to the cart.</p>
          ) : null}
          {product.enabled && product.stock < 1 ? (
            <p className="mt-2 text-sm text-muted">Unavailable products cannot be added to the cart.</p>
          ) : null}
          {product.enabled && product.stock > 0 && remaining < 1 ? (
            <p className="mt-2 text-sm text-muted">Your cart already holds the placeholder stock for this product.</p>
          ) : null}

          {canAdd ? (
            <div className="mt-8">
              <p id={`${product.id}-quantity`} className={eyebrowClass}>
                Quantity
              </p>
              <div className="mt-3" role="group" aria-labelledby={`${product.id}-quantity`}>
                <QuantityStepper value={quantity} max={remaining} onChange={setRequested} />
              </div>
            </div>
          ) : null}

          <button type="button" className={`${pillButtonClass} mt-8`} disabled={!canAdd} onClick={onAdd}>
            Add to cart
          </button>
          <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm text-ink">
            {notice}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className={pillGhostClass}>
              Keep shopping
            </Link>
            <Link href="/cart" className={pillGhostClass}>
              Go to cart
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="mt-16">
          <h2 id="related-title" className="font-serif text-3xl tracking-[-0.03em] text-ink">
            Related placeholder products
          </h2>
          <ul className="mt-6 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <li key={item.id} className="min-w-0">
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
