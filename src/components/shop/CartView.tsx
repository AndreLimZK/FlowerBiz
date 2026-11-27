"use client";

import { useCommerceHydrated } from "@/components/CommerceHydration";
import { EmptyState } from "@/components/site/EmptyState";
import { ProductPlaceholder } from "@/components/site/ProductPlaceholder";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { useShopProducts } from "@/components/shop/useShopProducts";
import { eyebrowClass, pillButtonClass, pillGhostClass } from "@/components/site/classes";
import {
  describeCustomBouquet,
  shopLineAvailability,
  type ResolvedOption,
  type ShopLineAvailabilityView,
} from "@/lib/cartDisplay";
import { priceCart } from "@/lib/pricing";
import { formatCatalogueAmount } from "@/lib/shopCatalogue";
import { useCartStore } from "@/stores/cartStore";
import type { CartLine, CustomCartLine, ShopCartLine } from "@/types/commerce";
import { CATALOGUE_PRICE_LABEL, PROVISIONAL_ESTIMATE_LABEL } from "@/types/commerce";
import Link from "next/link";
import { useState } from "react";

const lineButtonClass =
  "rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink transition-colors hover:bg-studio focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

export function CartView() {
  const hydrated = useCommerceHydrated();
  const lines = useCartStore((state) => state.lines);
  const products = useShopProducts();

  if (!hydrated) {
    return (
      <div>
        <p className={eyebrowClass}>Cart</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-ink md:text-5xl">Cart</h1>
        <p role="status" className="mt-6 text-base text-muted">
          Loading cart…
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div>
        <p className={eyebrowClass}>Cart</p>
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            titleAs="h1"
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/shop" className={pillButtonClass}>
                  Continue shopping
                </Link>
                <Link href="/customise" className={pillGhostClass}>
                  Customise a bouquet
                </Link>
              </div>
            }
          >
            Add a ready-made bouquet from the shop, or arrange one in the customiser. Nothing is stored on a server.
          </EmptyState>
        </div>
      </div>
    );
  }

  return <FilledCart lines={lines} products={products} />;
}

function FilledCart({
  lines,
  products,
}: {
  lines: CartLine[];
  products: ReturnType<typeof useShopProducts>;
}) {
  const priced = priceCart(lines, products);
  const amountById = new Map(priced.lines.map((line) => [line.id, line.amount]));
  const hasShopLine = lines.some((line) => line.kind === "shop");

  return (
    <div>
      <p className={eyebrowClass}>Cart</p>
      <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-ink md:text-5xl">Your cart</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Ready-made quantities and custom bouquets saved in this browser. Catalogue prices and custom estimates are
        provisional.
      </p>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="grid list-none gap-5">
          {lines.map((line, index) => (
            <li key={line.id}>
              {line.kind === "shop" ? (
                <ShopLine line={line} products={products} lineAmount={amountById.get(line.id) ?? 0} />
              ) : (
                <CustomLine
                  line={line}
                  position={index + 1}
                  lineAmount={amountById.get(line.id) ?? line.estimate}
                />
              )}
            </li>
          ))}
        </ul>
        <CartSummary
          amount={priced.amount}
          includesProvisionalEstimate={priced.includesProvisionalEstimate}
          hasShopLine={hasShopLine}
        />
      </div>
    </div>
  );
}

function ShopLine({
  line,
  products,
  lineAmount,
}: {
  line: ShopCartLine;
  products: ReturnType<typeof useShopProducts>;
  lineAmount: number;
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const view = shopLineAvailability(products, line);
  const message = availabilityMessage(view);
  const name = view.product?.name ?? "Invalid line";

  return (
    <article aria-labelledby={`cart-line-${line.id}-title`} className="rounded-[1.75rem] border border-line bg-panel p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <ProductPlaceholder
          productId={line.productId}
          label={view.product?.imageLabel ?? "Placeholder. This product id is not in the catalogue."}
          className="h-36"
        />
        <div className="min-w-0">
          <h2 id={`cart-line-${line.id}-title`} className="font-serif text-3xl tracking-[-0.03em] text-ink">
            {name}
          </h2>
          {view.availability === "missing" ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Invalid line. No catalogue product uses the id “{line.productId}”.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-muted">{view.product?.summary}</p>
          )}
          {view.unitPrice !== null ? (
            <div className="mt-5">
              <UnitPrice amount={view.unitPrice} />
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">No catalogue price for this line.</p>
          )}
          {message ? <p className="mt-4 text-sm leading-relaxed text-ink">{message}</p> : null}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            {view.availability === "missing" ? (
              <p className="text-sm text-ink">Quantity {line.quantity}. It cannot change.</p>
            ) : (
              <div>
                <p id={`cart-qty-${line.id}`} className={eyebrowClass}>
                  Quantity
                </p>
                <div className="mt-3" role="group" aria-labelledby={`cart-qty-${line.id}`}>
                  <QuantityStepper
                    value={line.quantity}
                    max={view.maxQuantity}
                    decreaseLabel={`Decrease ${name} quantity`}
                    increaseLabel={`Increase ${name} quantity`}
                    onChange={(quantity) => updateQuantity(line.id, quantity)}
                  />
                </div>
              </div>
            )}
            <LineSubtotal amount={view.availability === "missing" ? null : lineAmount} />
          </div>
          <button
            type="button"
            className={`${lineButtonClass} mt-5`}
            aria-label={view.availability === "missing" ? "Remove invalid line" : `Remove ${name}`}
            onClick={() => removeLine(line.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function CustomLine({
  line,
  position,
  lineAmount,
}: {
  line: CustomCartLine;
  position: number;
  lineAmount: number;
}) {
  const removeLine = useCartStore((state) => state.removeLine);
  const details = describeCustomBouquet(line.configuration);
  const flowerLabel = details.flowerCount === 1 ? "1 flower" : `${details.flowerCount} flowers`;

  return (
    <article aria-labelledby={`cart-line-${line.id}-title`} className="rounded-[1.75rem] border border-line bg-panel p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
        <CustomPreview flowerLabel={flowerLabel} />
        <div className="min-w-0">
          <p className={eyebrowClass}>Custom bouquet</p>
          <h2 id={`cart-line-${line.id}-title`} className="mt-2 font-serif text-3xl tracking-[-0.03em] text-ink">
            {line.title}
          </h2>
          <p className="mt-4 text-sm text-ink">{flowerLabel}</p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {details.types.map((type) => (
              <li key={type.key}>
                {type.name}
                {type.colour ? `, ${type.colour}` : ", colour not in the prototype list"} × {type.count}
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1">
            <OptionLine name="Wrapping" option={details.wrapping} />
            <OptionLine name="Stem" option={details.stem} />
            <OptionLine name="Ribbon" option={details.ribbon} />
          </div>
          <p className="mt-4 text-sm text-muted">Quantity 1. A custom bouquet is not changed from the cart.</p>
          <div className="mt-5">
            <p className="font-serif text-3xl leading-none tracking-[-0.03em] text-ink tabular-nums">
              {formatCatalogueAmount(line.estimate)}
            </p>
            <p className="mt-2 text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">
              {line.priceLabel || PROVISIONAL_ESTIMATE_LABEL}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">Not a confirmed business price.</p>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <LineSubtotal amount={lineAmount} />
          </div>
          <button
            type="button"
            className={`${lineButtonClass} mt-5`}
            aria-label={`Remove custom bouquet ${position}, ${flowerLabel}`}
            onClick={() => removeLine(line.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function CustomPreview({ flowerLabel }: { flowerLabel: string }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder preview. ${flowerLabel}. Not a 3D scene.`}
      className="relative flex h-36 flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.25rem] border border-line bg-[#e7efe4] px-3 text-center"
    >
      <span className="text-[0.72rem] font-medium tracking-[0.18em] text-ink/80 uppercase">Placeholder</span>
      <span className="text-sm text-ink">{flowerLabel}</span>
      <span className="text-xs leading-relaxed text-muted">Not a 3D scene</span>
    </div>
  );
}

function OptionLine({ name, option }: { name: string; option: ResolvedOption }) {
  return (
    <p className="text-sm text-ink">
      <span className="text-muted">{name}. </span>
      {option.label ?? "This id is not in the prototype options."}
    </p>
  );
}

function UnitPrice({ amount }: { amount: number }) {
  return (
    <div>
      <p className="text-sm text-muted">Unit price</p>
      <p className="mt-1 font-serif text-3xl leading-none tracking-[-0.03em] text-ink tabular-nums">
        {formatCatalogueAmount(amount)}
      </p>
      <p className="mt-2 text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">Provisional price</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {CATALOGUE_PRICE_LABEL}. Not a confirmed business price.
      </p>
    </div>
  );
}

function LineSubtotal({ amount }: { amount: number | null }) {
  return (
    <p className="text-sm text-ink">
      Line subtotal{" "}
      <span className="font-serif text-2xl tracking-[-0.03em] tabular-nums">
        {amount === null ? "—" : formatCatalogueAmount(amount)}
      </span>
    </p>
  );
}

function availabilityMessage(view: ShopLineAvailabilityView): string | null {
  if (view.availability === "disabled") return "Disabled in this prototype. Quantity cannot increase.";
  if (view.availability === "unavailable") return "Unavailable. Quantity cannot increase.";
  if (view.availability === "at-stock") {
    return `Placeholder stock is ${view.product?.stock ?? 0}. Quantity cannot increase.`;
  }
  if (view.availability === "over-stock") {
    return `Quantity is above the placeholder stock of ${view.product?.stock ?? 0}. Quantity cannot increase.`;
  }
  return null;
}

function CartSummary({
  amount,
  includesProvisionalEstimate,
  hasShopLine,
}: {
  amount: number;
  includesProvisionalEstimate: boolean;
  hasShopLine: boolean;
}) {
  const clear = useCartStore((state) => state.clear);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const shown = formatCatalogueAmount(amount);

  return (
    <aside aria-label="Cart total" className="rounded-[1.75rem] border border-line bg-panel p-6 lg:sticky lg:top-6">
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Total</h2>
      <div aria-live="polite" className="mt-6 space-y-5">
        <p className="flex items-baseline justify-between gap-4 text-sm text-ink">
          <span>Subtotal</span>
          <span className="font-serif text-3xl tracking-[-0.03em] tabular-nums">{shown}</span>
        </p>
        <p className="flex items-baseline justify-between gap-4 text-sm text-ink">
          <span>Estimated total</span>
          <span className="font-serif text-3xl tracking-[-0.03em] tabular-nums">{shown}</span>
        </p>
      </div>
      <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
        <p className="text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">Provisional</p>
        {hasShopLine ? <p>Catalogue prices are provisional placeholders, not confirmed business prices.</p> : null}
        {includesProvisionalEstimate ? <p>This total includes a provisional estimate for a custom bouquet.</p> : null}
        <p>Delivery fees are not in this total. They are added at checkout.</p>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/checkout" className={pillButtonClass}>
          Proceed to checkout
        </Link>
        <Link href="/shop" className={pillGhostClass}>
          Continue shopping
        </Link>
      </div>
      {confirmingClear ? (
        <div role="group" aria-label="Clear cart confirmation" className="mt-6 rounded-2xl border border-line bg-studio p-4">
          <p className="text-sm leading-relaxed text-ink">Clear the cart? This removes every line saved in this browser.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={lineButtonClass}
              onClick={() => {
                clear();
                setConfirmingClear(false);
              }}
            >
              Confirm clear
            </button>
            <button type="button" className={lineButtonClass} onClick={() => setConfirmingClear(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={`${lineButtonClass} mt-6`} onClick={() => setConfirmingClear(true)}>
          Clear cart
        </button>
      )}
    </aside>
  );
}
