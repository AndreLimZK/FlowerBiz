import type { FlowerColourVariant, FlowerProduct } from "@/types/flower";

/**
 * DEVELOPMENT PLACEHOLDERS.
 * Not the business catalogue. `basePrice` is required by the product type and
 * is not a price — do not display it. An empty `modelUrl` means the preview
 * uses the procedural flower until a real model exists.
 *
 * A modelUrl is a site path such as `/models/flowers/<product-id>/<colour-id>.glb`.
 * Colour variants that need their own file set modelUrl on the colour. The
 * bouquet stores the ids only. How many of each colour are in stock lives in
 * `src/lib/flowerQuantities.ts`, not on the product.
 */
export const DEV_FLOWER_PRODUCTS: readonly FlowerProduct[] = [
  {
    id: "dev-rose",
    name: "Rose",
    description: "Development stand-in. The business has not confirmed this flower.",
    modelUrl: "",
    thumbnailUrl: "",
    availableColours: ["dev-rose-blush"],
    basePrice: 0,
    enabled: true,
  },
  {
    id: "dev-daisy",
    name: "Daisy",
    description: "Development stand-in. The business has not confirmed this flower.",
    modelUrl: "",
    thumbnailUrl: "",
    availableColours: ["dev-daisy-cream"],
    basePrice: 0,
    enabled: true,
  },
  {
    id: "dev-stem-test",
    name: "Stem test",
    description: "Development geometry. Primitive meshes in a glTF file, not a catalogue flower.",
    modelUrl: "/models/dev/stem-test.glb",
    thumbnailUrl: "",
    availableColours: ["dev-stem-test-plain"],
    basePrice: 0,
    enabled: true,
  },
  {
    id: "dev-missing-model",
    name: "Missing model",
    description: "Development stand-in. The dev quantity table lists this colour as zero.",
    modelUrl: "",
    thumbnailUrl: "",
    availableColours: ["dev-missing-model-none"],
    basePrice: 0,
    enabled: true,
  },
];

/** Display names and approved model or material keys. The bouquet stores the id only. */
export const DEV_FLOWER_COLOURS: readonly FlowerColourVariant[] = [
  { id: "dev-rose-blush", name: "Blush", modelUrl: "", materialKey: "" },
  { id: "dev-daisy-cream", name: "Cream", modelUrl: "", materialKey: "" },
  {
    id: "dev-stem-test-plain",
    name: "Plain",
    modelUrl: "/models/dev/stem-test.glb",
    materialKey: "dev-plain",
  },
  { id: "dev-missing-model-none", name: "None", modelUrl: "", materialKey: "" },
];

export function devFlowerProduct(productId: string): FlowerProduct | undefined {
  return DEV_FLOWER_PRODUCTS.find((product) => product.id === productId);
}

export function devColourName(colourId: string): string | undefined {
  return DEV_FLOWER_COLOURS.find((colour) => colour.id === colourId)?.name;
}

function trimmedUrl(url: string | undefined): string {
  return url?.trim() ?? "";
}

/**
 * The colour's modelUrl wins when it is set, so each variant can point at its
 * own file. Empty strings stay unset and the scene shows procedural geometry.
 */
export function devFlowerModelUrl(productId: string, colourId?: string): string | undefined {
  const colourUrl = trimmedUrl(DEV_FLOWER_COLOURS.find((colour) => colour.id === colourId)?.modelUrl);
  if (colourUrl.length > 0) return colourUrl;
  const productUrl = trimmedUrl(devFlowerProduct(productId)?.modelUrl);
  return productUrl.length > 0 ? productUrl : undefined;
}

/** Approved material name for this colour, when the business has supplied one. */
export function devFlowerMaterialKey(colourId: string | undefined): string | undefined {
  const materialKey = DEV_FLOWER_COLOURS.find((colour) => colour.id === colourId)?.materialKey.trim() ?? "";
  return materialKey.length > 0 ? materialKey : undefined;
}
