export type FlowerProduct = {
  id: string;
  name: string;
  description?: string;
  /** Site path to a `.glb` or `.gltf`. Empty until a model exists. */
  modelUrl: string;
  thumbnailUrl: string;
  availableColours: string[];
  basePrice: number;
  enabled: boolean;
};

/**
 * An approved colour. A different surface is another modelUrl or a material
 * name that already exists in that file. It is not a tint.
 */
export type FlowerColourVariant = {
  id: string;
  name: string;
  /** Overrides the product modelUrl when set. Empty uses the product model. */
  modelUrl: string;
  /** Material name supplied in the file. Empty when the model has no such key. */
  materialKey: string;
};
