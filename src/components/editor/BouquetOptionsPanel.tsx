"use client";

import {
  DEV_RIBBON_OPTIONS,
  DEV_STEM_OPTIONS,
  DEV_WRAPPING_OPTIONS,
} from "@/data/options";
import { useBouquetStore } from "@/stores/bouquetStore";

const selectClassName =
  "mt-2 w-full rounded-xl border border-line bg-studio px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

export function BouquetOptionsPanel() {
  const wrappingId = useBouquetStore((state) => state.configuration.wrappingId);
  const stemOptionId = useBouquetStore((state) => state.configuration.stemOptionId);
  const ribbonId = useBouquetStore((state) => state.configuration.ribbonId);
  const setWrappingId = useBouquetStore((state) => state.setWrappingId);
  const setStemOptionId = useBouquetStore((state) => state.setStemOptionId);
  const setRibbonId = useBouquetStore((state) => state.setRibbonId);

  return (
    <section
      aria-label="Bouquet options"
      className="flex shrink-0 flex-col rounded-[1.75rem] border border-line bg-panel p-7"
    >
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Options
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Development placeholders. These choices are saved with the bouquet. They
        do not change the preview yet.
      </p>
      <label htmlFor="bouquet-wrapping" className="mt-6 block text-sm text-ink">
        Wrapping
        <select
          id="bouquet-wrapping"
          className={selectClassName}
          value={wrappingId}
          onChange={(event) => setWrappingId(event.target.value)}
        >
          {DEV_WRAPPING_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="bouquet-stem" className="mt-5 block text-sm text-ink">
        Stem
        <select
          id="bouquet-stem"
          className={selectClassName}
          value={stemOptionId}
          onChange={(event) => setStemOptionId(event.target.value)}
        >
          {DEV_STEM_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="bouquet-ribbon" className="mt-5 block text-sm text-ink">
        Ribbon
        <select
          id="bouquet-ribbon"
          className={selectClassName}
          value={ribbonId}
          onChange={(event) => setRibbonId(event.target.value)}
        >
          {DEV_RIBBON_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
