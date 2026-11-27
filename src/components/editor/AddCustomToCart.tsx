"use client";

import { pillButtonClass, pillGhostClass } from "@/components/site/classes";
import { snapshotBouquetConfiguration } from "@/lib/snapshotBouquet";
import { useBouquetStore } from "@/stores/bouquetStore";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import { useState } from "react";

type Feedback = { kind: "added"; lineId: string } | { kind: "empty" };

/**
 * Appends one independent snapshot of the bouquet on screen.
 * The editor configuration, selection, and undo history stay as they are.
 */
export function AddCustomToCart() {
  const flowerCount = useBouquetStore((state) => state.configuration.flowers.length);
  const addCustomConfiguration = useCartStore((state) => state.addCustomConfiguration);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function onAdd() {
    const configuration = useBouquetStore.getState().configuration;
    const snapshot = snapshotBouquetConfiguration(configuration);
    if (!snapshot) {
      setFeedback({ kind: "empty" });
      return;
    }
    const lineId = addCustomConfiguration(configuration);
    if (!lineId) {
      setFeedback({ kind: "empty" });
      return;
    }
    setFeedback({ kind: "added", lineId });
  }

  return (
    <section aria-label="Add bouquet to cart" className="rounded-[1.75rem] border border-line bg-panel p-7">
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Cart</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Adds a separate copy of this bouquet. The editor stays as it is, and a later add does not change an earlier
        line.
      </p>
      <button type="button" className={`${pillButtonClass} mt-6`} onClick={onAdd}>
        Add to cart
      </button>
      <div role="status" aria-live="polite" className="mt-4 min-h-6 text-sm leading-relaxed text-ink">
        {feedback?.kind === "added" ? (
          <p>Added to the cart. This bouquet is still in the editor.</p>
        ) : null}
        {feedback?.kind === "empty" ? (
          <p>An empty bouquet stays out of the cart. Place at least one flower.</p>
        ) : null}
        {feedback === null && flowerCount === 0 ? (
          <p className="text-muted">Place at least one flower before adding this bouquet.</p>
        ) : null}
      </div>
      {feedback?.kind === "added" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/cart" className={pillGhostClass}>
            View cart
          </Link>
          <Link href="#bouquet-editor" className={pillGhostClass} onClick={() => setFeedback(null)}>
            Keep editing
          </Link>
        </div>
      ) : null}
    </section>
  );
}
