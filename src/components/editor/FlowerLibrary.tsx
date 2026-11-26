"use client";

import { devColourName, devFlowerProduct, DEV_FLOWER_PRODUCTS } from "@/data/flowers";
import { isSoldOut, useFlowerQuantities } from "@/lib/flowerQuantities";
import { useBouquetStore } from "@/stores/bouquetStore";

function FlowerSwatch({ productId }: { productId: string }) {
  if (productId === "dev-stem-test" || productId === "dev-missing-model") {
    const missing = productId === "dev-missing-model";
    return (
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="h-14 w-14 shrink-0 rounded-2xl border border-line bg-[#f6f1ea]"
      >
        {missing ? (
          <>
            <circle cx="32" cy="26" r="12" fill="none" stroke="#a33b52" strokeWidth="1.5" />
            <path d="M24 18 L40 34" stroke="#a33b52" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <rect x="30" y="20" width="4" height="26" rx="2" fill="#4a6342" />
            <circle cx="32" cy="16" r="8" fill="#c47a86" />
          </>
        )}
        <text
          x="32"
          y="56"
          textAnchor="middle"
          fontSize="8"
          letterSpacing="0.12em"
          fill="#6f685f"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          DEV
        </text>
      </svg>
    );
  }

  const daisy = productId === "dev-daisy";
  const petal = daisy ? "#f4efe2" : "#c94b63";
  const petalEdge = daisy ? "#d9cbb6" : "#a33b52";
  const centre = daisy ? "#e6b34a" : "#e58b98";
  const petals = [0, 60, 120, 180, 240, 300];

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-14 w-14 shrink-0 rounded-2xl border border-line bg-[#f6f1ea]"
    >
      {petals.map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const cx = 32 + Math.cos(radians) * 11;
        const cy = 26 + Math.sin(radians) * 11;
        return (
          <circle
            key={angle}
            cx={cx}
            cy={cy}
            r={daisy ? 8 : 6.5}
            fill={petal}
            stroke={petalEdge}
            strokeWidth="1"
          />
        );
      })}
      <circle cx="32" cy="26" r={daisy ? 5.5 : 4.5} fill={centre} />
      <text
        x="32"
        y="56"
        textAnchor="middle"
        fontSize="8"
        letterSpacing="0.12em"
        fill="#6f685f"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        DEV
      </text>
    </svg>
  );
}

const cardClassName =
  "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

export function FlowerLibrary() {
  const flowers = useBouquetStore((state) => state.configuration.flowers);
  const selectedInstanceId = useBouquetStore((state) => state.selectedInstanceId);
  const addFlower = useBouquetStore((state) => state.addFlower);
  const selectFlower = useBouquetStore((state) => state.selectFlower);
  const quantities = useFlowerQuantities();

  return (
    <section
      aria-label="Flower library"
      className="flex h-full min-h-0 flex-col overflow-y-auto rounded-[1.75rem] border border-line bg-panel p-7"
    >
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Flowers</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Development placeholders, until the business confirms the catalogue. The thumbnail is a drawn
        swatch, not a photograph.
      </p>
      <ul className="mt-6 space-y-3">
        {DEV_FLOWER_PRODUCTS.filter((product) => product.enabled).map((product) => {
          const soldOut = isSoldOut(quantities, product.id, product.availableColours[0]);
          return (
            <li key={product.id}>
              <button
                type="button"
                className={`${cardClassName} border-line ${soldOut ? "cursor-not-allowed" : "hover:bg-studio"}`}
                aria-label={soldOut ? `${product.name}, sold out` : `Add ${product.name}`}
                aria-disabled={soldOut}
                disabled={soldOut}
                onClick={() => {
                  if (soldOut) return;
                  addFlower(product.id);
                }}
              >
                <FlowerSwatch productId={product.id} />
                <span>
                  <span className="block text-sm text-ink">{product.name}</span>
                  {soldOut ? (
                    <span className="mt-0.5 block text-xs font-medium text-ink">Sold out</span>
                  ) : (
                    <span className="mt-0.5 block text-xs text-muted">
                      {product.modelUrl.trim() ? "Test model" : "Development swatch"}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <h3 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Placed</h3>
        {flowers.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">Nothing placed yet. Click a flower above to add one.</p>
        ) : (
          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {flowers.map((flower, index) => {
              const product = devFlowerProduct(flower.productId);
              const name = product?.name ?? "Flower";
              const colour = devColourName(flower.colourId);
              const selected = flower.instanceId === selectedInstanceId;
              return (
                <li key={flower.instanceId}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    className={`${cardClassName} ${selected ? "border-sage bg-studio" : "border-line hover:bg-studio"}`}
                    onClick={() => selectFlower(flower.instanceId)}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-ink">
                        {name}
                        <span className="text-muted"> · {index + 1}</span>
                      </span>
                      {colour ? <span className="mt-0.5 block text-xs text-muted">{colour}</span> : null}
                    </span>
                    {selected ? <span className="ml-auto shrink-0 text-xs text-sage">Selected</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
