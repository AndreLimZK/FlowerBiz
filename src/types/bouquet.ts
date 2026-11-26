export type BouquetFlower = {
  instanceId: string;
  productId: string;
  colourId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
};

export type BouquetConfiguration = {
  schemaVersion: 1;
  flowers: BouquetFlower[];
  wrappingId: string;
  stemOptionId: string;
  ribbonId: string;
  createdAt?: string;
  updatedAt?: string;
};
