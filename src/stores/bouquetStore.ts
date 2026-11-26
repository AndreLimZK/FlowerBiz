import { create } from "zustand";
import type { BouquetConfiguration } from "@/types/bouquet";

export const emptyBouquetConfiguration: BouquetConfiguration = {
  schemaVersion: 1,
  flowers: [],
  wrappingId: "",
  stemOptionId: "",
  ribbonId: "",
};

type BouquetStoreState = {
  configuration: BouquetConfiguration;
  selectedInstanceId: string | null;
};

export const useBouquetStore = create<BouquetStoreState>(() => ({
  configuration: emptyBouquetConfiguration,
  selectedInstanceId: null,
}));
