"use client";

import { useBouquetStore } from "@/stores/bouquetStore";

export function PriceSummary() {
  const count = useBouquetStore((state) => state.configuration.flowers.length);
  const summary =
    count === 0
      ? "Nothing is placed in this bouquet yet."
      : count === 1
        ? "1 flower is placed in this bouquet."
        : `${count} flowers are placed in this bouquet.`;

  return (
    <section
      aria-label="Bouquet summary"
      className="rounded-[1.75rem] border border-line bg-panel p-7"
    >
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Summary
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-ink">{summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The estimate will appear here once the business confirms pricing.
      </p>
    </section>
  );
}
