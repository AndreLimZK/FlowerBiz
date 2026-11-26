export type FlowerProduct = {
  id: string;
  name: string;
  description?: string;
  modelUrl: string;
  thumbnailUrl: string;
  availableColours: string[];
  basePrice: number;
  enabled: boolean;
};
