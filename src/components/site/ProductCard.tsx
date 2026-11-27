import { ProductPlaceholder } from "@/components/site/ProductPlaceholder";
import { ProvisionalPrice } from "@/components/site/ProvisionalPrice";
import { availabilityLabel, shopCategory } from "@/lib/shopCatalogue";
import type { ShopProduct } from "@/types/commerce";
import Link from "next/link";

export function ProductCard({ product }: { product: ShopProduct }) {
  const category = shopCategory(product);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="flex h-full flex-col rounded-[1.75rem] border border-line bg-panel p-5 transition-colors hover:border-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
    >
      <ProductPlaceholder productId={product.id} label={product.imageLabel} />
      <p className="mt-5 text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">
        Placeholder category
        <span className="text-ink"> · {category}</span>
      </p>
      <h3 className="mt-2 font-serif text-[1.7rem] leading-tight tracking-[-0.03em] text-ink">{product.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{product.summary}</p>
      <div className="mt-auto pt-6">
        <ProvisionalPrice amount={product.price} compact />
        {typeof product.mockPopularity === "number" ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Mock popularity {product.mockPopularity}. Not sales data.
          </p>
        ) : null}
        <p className="mt-3 text-sm text-ink">{availabilityLabel(product)}</p>
      </div>
    </Link>
  );
}
