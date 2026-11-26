"use client";

import { useBouquetStore } from "@/stores/bouquetStore";

export function SelectedFlowerPanel() {
  const selectedInstanceId = useBouquetStore(
    (state) => state.selectedInstanceId,
  );

  return (
    <section className="px-5 py-5" aria-labelledby="selected-flower-heading">
      <p className="text-xs font-medium tracking-[0.14em] text-moss uppercase">
        Selection
      </p>
      <h2
        id="selected-flower-heading"
        className="mt-1 font-serif text-2xl tracking-tight"
      >
        Selected flower
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {selectedInstanceId === null
          ? "No flower is selected."
          : `Instance ${selectedInstanceId} is selected.`}
      </p>
    </section>
  );
}
