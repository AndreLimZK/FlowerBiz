"use client";

import { getEstimatedPrice } from "@/lib/pricing";
import { useBouquetStore } from "@/stores/bouquetStore";

export function PriceSummary() {
  const flowerCount = useBouquetStore(
    (state) => state.configuration.flowers.length,
  );
  const estimate = getEstimatedPrice();

  return (
    <section
      className="mt-auto border-t border-line px-5 py-5"
      aria-labelledby="price-summary-heading"
    >
      <h2
        id="price-summary-heading"
        className="font-serif text-xl tracking-tight"
      >
        Summary
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt>Flowers</dt>
          <dd>{flowerCount}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt>Estimate</dt>
          <dd className="text-right text-muted">
            {estimate === null ? "Not available" : estimate}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        The final price is confirmed by the studio after review.
      </p>
    </section>
  );
}
