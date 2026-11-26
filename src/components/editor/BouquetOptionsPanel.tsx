"use client";

import {
  ribbonOptions,
  stemOptions,
  wrappingOptions,
} from "@/data/options";
import { useBouquetStore } from "@/stores/bouquetStore";

const optionGroups = [
  { label: "Wrapping", field: "wrappingId", options: wrappingOptions },
  { label: "Stems", field: "stemOptionId", options: stemOptions },
  { label: "Ribbon", field: "ribbonId", options: ribbonOptions },
] as const;

export function BouquetOptionsPanel() {
  const configuration = useBouquetStore((state) => state.configuration);

  return (
    <section
      className="border-t border-line px-5 py-5"
      aria-labelledby="bouquet-options-heading"
    >
      <h2
        id="bouquet-options-heading"
        className="font-serif text-xl tracking-tight"
      >
        Options
      </h2>
      <ul className="mt-4 space-y-3">
        {optionGroups.map((group) => {
          const selectedId = configuration[group.field];

          return (
            <li
              key={group.field}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span>{group.label}</span>
              <span className="text-muted">
                {group.options.length === 0
                  ? "Not available"
                  : selectedId === ""
                    ? "Not selected"
                    : selectedId}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Wrapping, stem, and ribbon choices are not available yet.
      </p>
    </section>
  );
}
