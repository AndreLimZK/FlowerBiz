"use client";

import { devColourName, devFlowerProduct, DEV_FLOWER_PRODUCTS } from "@/data/flowers";
import {
  DEV_DEFAULT_RIBBON_ID,
  DEV_DEFAULT_STEM_OPTION_ID,
  DEV_DEFAULT_WRAPPING_ID,
} from "@/data/options";
import { useBouquetStore } from "@/stores/bouquetStore";

const buttonClassName =
  "rounded-full border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:bg-studio focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-40";

export function FlowerLibrary() {
  const flowers = useBouquetStore((state) => state.configuration.flowers);
  const wrappingId = useBouquetStore((state) => state.configuration.wrappingId);
  const stemOptionId = useBouquetStore((state) => state.configuration.stemOptionId);
  const ribbonId = useBouquetStore((state) => state.configuration.ribbonId);
  const addFlower = useBouquetStore((state) => state.addFlower);
  const removeFlower = useBouquetStore((state) => state.removeFlower);
  const duplicateFlower = useBouquetStore((state) => state.duplicateFlower);
  const resetBouquet = useBouquetStore((state) => state.resetBouquet);
  const pristine =
    flowers.length === 0 &&
    wrappingId === DEV_DEFAULT_WRAPPING_ID &&
    stemOptionId === DEV_DEFAULT_STEM_OPTION_ID &&
    ribbonId === DEV_DEFAULT_RIBBON_ID;

  return (
    <section
      aria-label="Flower library"
      className="flex h-full min-h-0 flex-col rounded-[1.75rem] border border-line bg-panel p-7"
    >
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Flowers
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Development placeholders, until the business confirms the catalogue.
      </p>
      <ul className="mt-6 space-y-3">
        {DEV_FLOWER_PRODUCTS.filter((product) => product.enabled).map((product) => (
          <li key={product.id} className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink">{product.name}</span>
            <button
              type="button"
              className={buttonClassName}
              aria-label={`Add ${product.name}`}
              onClick={() => addFlower(product.id)}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <h3 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
          Placed
        </h3>
        {flowers.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">Nothing placed yet.</p>
        ) : (
          <ul className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
            {flowers.map((flower, index) => {
              const product = devFlowerProduct(flower.productId);
              const name = product?.name ?? "Flower";
              const colour = devColourName(flower.colourId);
              const label = `${name}, flower ${index + 1}`;
              return (
                <li key={flower.instanceId} className="flex items-start justify-between gap-3">
                  <span className="text-sm text-ink">
                    {name}
                    {colour ? <span className="mt-0.5 block text-xs text-muted">{colour}</span> : null}
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className={buttonClassName}
                      aria-label={`Duplicate ${label}`}
                      onClick={() => duplicateFlower(flower.instanceId)}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className={buttonClassName}
                      aria-label={`Remove ${label}`}
                      onClick={() => removeFlower(flower.instanceId)}
                    >
                      Remove
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <button
        type="button"
        className={`${buttonClassName} mt-6 self-start`}
        disabled={pristine}
        onClick={() => {
          const confirmed = window.confirm(
            "Reset this bouquet? Placed flowers are removed, and wrapping, stem, and ribbon return to the development defaults.",
          );
          if (confirmed) resetBouquet();
        }}
      >
        Reset bouquet
      </button>
    </section>
  );
}
