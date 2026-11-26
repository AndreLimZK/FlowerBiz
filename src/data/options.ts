/**
 * DEVELOPMENT PLACEHOLDERS.
 * Stable ids for wrapping, stem, and ribbon until the business confirms them.
 * These records have no prices and no 3D assets.
 */
export type DevBouquetOption = {
  id: string;
  name: string;
};

export const DEV_WRAPPING_OPTIONS: readonly DevBouquetOption[] = [
  { id: "dev-wrap-kraft", name: "Kraft paper" },
  { id: "dev-wrap-tissue", name: "Tissue paper" },
];

export const DEV_STEM_OPTIONS: readonly DevBouquetOption[] = [
  { id: "dev-stem-short", name: "Short stem" },
  { id: "dev-stem-long", name: "Long stem" },
];

export const DEV_RIBBON_OPTIONS: readonly DevBouquetOption[] = [
  { id: "dev-ribbon-none", name: "No ribbon" },
  { id: "dev-ribbon-cotton", name: "Cotton ribbon" },
];

export const DEV_DEFAULT_WRAPPING_ID = DEV_WRAPPING_OPTIONS[0].id;
export const DEV_DEFAULT_STEM_OPTION_ID = DEV_STEM_OPTIONS[0].id;
export const DEV_DEFAULT_RIBBON_ID = DEV_RIBBON_OPTIONS[0].id;

function hasOption(options: readonly DevBouquetOption[], id: string): boolean {
  return options.some((option) => option.id === id);
}

export function isDevWrappingId(id: string): boolean {
  return hasOption(DEV_WRAPPING_OPTIONS, id);
}

export function isDevStemOptionId(id: string): boolean {
  return hasOption(DEV_STEM_OPTIONS, id);
}

export function isDevRibbonId(id: string): boolean {
  return hasOption(DEV_RIBBON_OPTIONS, id);
}
