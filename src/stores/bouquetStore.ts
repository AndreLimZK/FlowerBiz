"use client";

import type { BouquetConfiguration } from "@/types/bouquet";
import { create } from "zustand";

type BouquetState = {
  configuration: BouquetConfiguration;
};

const initialConfiguration: BouquetConfiguration = {
  schemaVersion: 1,
  flowers: [],
  wrappingId: "",
  stemOptionId: "",
  ribbonId: "",
};

export const useBouquetStore = create<BouquetState>()(() => ({
  configuration: initialConfiguration,
}));
