import type { FlowerProduct } from "@/types/flower";

/**
 * DEVELOPMENT PLACEHOLDERS.
 * Not the business catalogue. `basePrice` is required by the product type and
 * is not a price — do not display it. An empty `modelUrl` means the preview
 * uses the procedural flower until a real model exists.
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
];

/** Display names for development colour ids. The bouquet stores the id only. */
export const DEV_FLOWER_COLOURS: readonly { id: string; name: string }[] = [
  { id: "dev-rose-blush", name: "Blush" },
  { id: "dev-daisy-cream", name: "Cream" },
];

export function devFlowerProduct(productId: string): FlowerProduct | undefined {
  return DEV_FLOWER_PRODUCTS.find((product) => product.id === productId);
}

export function devColourName(colourId: string): string | undefined {
  return DEV_FLOWER_COLOURS.find((colour) => colour.id === colourId)?.name;
}

/** Empty placeholder urls stay unset so the scene can show procedural geometry. */
export function devFlowerModelUrl(productId: string): string | undefined {
  const modelUrl = devFlowerProduct(productId)?.modelUrl.trim() ?? "";
  return modelUrl.length > 0 ? modelUrl : undefined;
}
