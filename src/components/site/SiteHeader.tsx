"use client";

import { useCommerceHydrated } from "@/components/CommerceHydration";
import { cartItemCount } from "@/lib/shopCatalogue";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";

const navClass =
  "text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage";

export function SiteHeader() {
  const hydrated = useCommerceHydrated();
  const count = useCartStore((state) => cartItemCount(state.lines));
  const itemLabel = count === 1 ? "item" : "items";
  const cartLabel = hydrated ? `Cart, ${count} ${itemLabel}` : "Cart, loading";

  return (
    <header className="shrink-0 border-b border-line">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6 md:h-[4.5rem] md:px-10 md:py-0">
        <Link
          href="/"
          className="font-serif text-[1.65rem] leading-none tracking-[-0.03em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
        >
          FlowerBiz
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/shop" className={navClass}>
            Shop
          </Link>
          <Link href="/customise" className={navClass}>
            Customise
          </Link>
          <Link href="/cart" className={navClass} aria-label={cartLabel}>
            Cart
            <span
              aria-live="polite"
              className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-ink px-1.5 py-0.5 text-xs text-studio tabular-nums"
            >
              {hydrated ? count : "…"}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
