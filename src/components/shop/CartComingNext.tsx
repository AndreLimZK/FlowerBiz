"use client";

import { pillButtonClass } from "@/components/site/classes";
import { cartItemCount } from "@/lib/shopCatalogue";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";

export function CartComingNext() {
  const count = useCartStore((state) => cartItemCount(state.lines));
  const itemLabel = count === 1 ? "item" : "items";

  return (
    <div className="max-w-2xl">
      <p className="text-[0.72rem] font-medium tracking-[0.2em] text-sage uppercase">Cart</p>
      <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-ink md:text-5xl">The cart page comes next.</h1>
      <p className="mt-6 text-base leading-relaxed text-muted">
        This browser’s cart count is {count} {itemLabel}. Line editing, totals, and checkout are not on this page.
      </p>
      <div className="mt-8">
        <Link href="/shop" className={pillButtonClass}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
