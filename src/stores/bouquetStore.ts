"use client";

import { devFlowerProduct } from "@/data/flowers";
import {
  DEV_DEFAULT_RIBBON_ID,
  DEV_DEFAULT_STEM_OPTION_ID,
  DEV_DEFAULT_WRAPPING_ID,
  isDevRibbonId,
  isDevStemOptionId,
  isDevWrappingId,
} from "@/data/options";
import type { BouquetConfiguration, BouquetFlower } from "@/types/bouquet";
import { create } from "zustand";

/**
 * The configuration is plain JSON: ids, numbers, and strings.
 * Three.js objects, refs, and class instances stay in the scene.
 */

type Vec3 = BouquetFlower["position"];

type BouquetActions = {
  addFlower: (productId: string, colourId?: string) => string | null;
  removeFlower: (instanceId: string) => void;
  updateFlowerPosition: (instanceId: string, position: Vec3) => void;
  updateFlowerRotation: (instanceId: string, rotation: Vec3) => void;
  updateFlowerScale: (instanceId: string, scale: Vec3) => void;
  duplicateFlower: (instanceId: string) => string | null;
  setWrappingId: (wrappingId: string) => void;
  setStemOptionId: (stemOptionId: string) => void;
  setRibbonId: (ribbonId: string) => void;
  resetBouquet: () => void;
};

const DUPLICATE_STEP = { x: 0.08, z: 0.05 };
const PLACEMENT_RADIUS = 0.11;

function now(): string {
  return new Date().toISOString();
}

function roundMetres(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function createInitialConfiguration(): BouquetConfiguration {
  const timestamp = now();
  return {
    schemaVersion: 1,
    flowers: [],
    wrappingId: DEV_DEFAULT_WRAPPING_ID,
    stemOptionId: DEV_DEFAULT_STEM_OPTION_ID,
    ribbonId: DEV_DEFAULT_RIBBON_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function copyVec3(value: Vec3): Vec3 | null {
  if (
    typeof value?.x !== "number" ||
    typeof value?.y !== "number" ||
    typeof value?.z !== "number" ||
    !Number.isFinite(value.x) ||
    !Number.isFinite(value.y) ||
    !Number.isFinite(value.z)
  ) {
    return null;
  }

  return { x: value.x, y: value.y, z: value.z };
}

function samePoint(a: Vec3, b: Vec3): boolean {
  return (
    Math.abs(a.x - b.x) < 0.000001 &&
    Math.abs(a.y - b.y) < 0.000001 &&
    Math.abs(a.z - b.z) < 0.000001
  );
}

function placementForIndex(index: number): Vec3 {
  if (index <= 0) return { x: 0, y: 0, z: 0 };
  const angle = index * 2.399963229728653;
  return {
    x: roundMetres(Math.cos(angle) * PLACEMENT_RADIUS),
    y: 0,
    z: roundMetres(Math.sin(angle) * PLACEMENT_RADIUS),
  };
}

function nextPosition(flowers: readonly BouquetFlower[]): Vec3 {
  for (let index = 0; index < flowers.length + 12; index += 1) {
    const candidate = placementForIndex(index);
    if (!flowers.some((flower) => samePoint(flower.position, candidate))) {
      return candidate;
    }
  }

  return {
    x: roundMetres(PLACEMENT_RADIUS + flowers.length * 0.01),
    y: 0,
    z: 0,
  };
}

function offsetDuplicate(origin: Vec3, flowers: readonly BouquetFlower[]): Vec3 {
  for (let step = 1; step <= 16; step += 1) {
    const candidate = {
      x: roundMetres(origin.x + DUPLICATE_STEP.x * step),
      y: origin.y,
      z: roundMetres(origin.z + DUPLICATE_STEP.z * step),
    };
    if (!samePoint(candidate, origin) && !flowers.some((flower) => samePoint(flower.position, candidate))) {
      return candidate;
    }
  }

  return {
    x: roundMetres(origin.x + DUPLICATE_STEP.x),
    y: roundMetres(origin.y + 0.02),
    z: roundMetres(origin.z + DUPLICATE_STEP.z),
  };
}

function withTimestamp(configuration: BouquetConfiguration, flowers = configuration.flowers): BouquetConfiguration {
  return {
    ...configuration,
    flowers,
    updatedAt: now(),
  };
}

function mapFlower(
  configuration: BouquetConfiguration,
  instanceId: string,
  update: (flower: BouquetFlower) => BouquetFlower,
): BouquetConfiguration | null {
  const index = configuration.flowers.findIndex((flower) => flower.instanceId === instanceId);
  if (index === -1) return null;

  const current = configuration.flowers[index];
  const next = update(current);
  if (next === current) return null;

  const flowers = configuration.flowers.slice();
  flowers[index] = next;
  return withTimestamp(configuration, flowers);
}

function resolveColourId(productId: string, colourId?: string): string | null {
  const product = devFlowerProduct(productId);
  if (!product?.enabled || product.availableColours.length === 0) return null;
  if (colourId === undefined) return product.availableColours[0];
  return product.availableColours.includes(colourId) ? colourId : null;
}

type BouquetConfigurationState = {
  configuration: BouquetConfiguration;
} & BouquetActions;

export const useBouquetStore = create<BouquetConfigurationState>()((set) => ({
  configuration: createInitialConfiguration(),

  addFlower: (productId, colourId) => {
    const resolvedColourId = resolveColourId(productId, colourId);
    if (!resolvedColourId) return null;

    const instanceId = crypto.randomUUID();
    const flower: BouquetFlower = {
      instanceId,
      productId,
      colourId: resolvedColourId,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    set((state) => ({
      configuration: withTimestamp(state.configuration, [
        ...state.configuration.flowers,
        { ...flower, position: nextPosition(state.configuration.flowers) },
      ]),
    }));

    return instanceId;
  },

  removeFlower: (instanceId) => {
    set((state) => {
      const flowers = state.configuration.flowers.filter((flower) => flower.instanceId !== instanceId);
      if (flowers.length === state.configuration.flowers.length) return state;
      return { configuration: withTimestamp(state.configuration, flowers) };
    });
  },

  updateFlowerPosition: (instanceId, position) => {
    const next = copyVec3(position);
    if (!next) return;
    set((state) => {
      const configuration = mapFlower(state.configuration, instanceId, (flower) =>
        samePoint(flower.position, next) ? flower : { ...flower, position: next },
      );
      return configuration ? { configuration } : state;
    });
  },

  updateFlowerRotation: (instanceId, rotation) => {
    const next = copyVec3(rotation);
    if (!next) return;
    set((state) => {
      const configuration = mapFlower(state.configuration, instanceId, (flower) =>
        samePoint(flower.rotation, next) ? flower : { ...flower, rotation: next },
      );
      return configuration ? { configuration } : state;
    });
  },

  updateFlowerScale: (instanceId, scale) => {
    const next = copyVec3(scale);
    if (!next) return;
    set((state) => {
      const configuration = mapFlower(state.configuration, instanceId, (flower) =>
        samePoint(flower.scale, next) ? flower : { ...flower, scale: next },
      );
      return configuration ? { configuration } : state;
    });
  },

  duplicateFlower: (instanceId) => {
    let duplicateId: string | null = null;

    set((state) => {
      const source = state.configuration.flowers.find((flower) => flower.instanceId === instanceId);
      if (!source) return state;

      duplicateId = crypto.randomUUID();
      const duplicate: BouquetFlower = {
        instanceId: duplicateId,
        productId: source.productId,
        colourId: source.colourId,
        position: offsetDuplicate(source.position, state.configuration.flowers),
        rotation: { x: source.rotation.x, y: source.rotation.y, z: source.rotation.z },
        scale: { x: source.scale.x, y: source.scale.y, z: source.scale.z },
      };

      return {
        configuration: withTimestamp(state.configuration, [...state.configuration.flowers, duplicate]),
      };
    });

    return duplicateId;
  },

  setWrappingId: (wrappingId) => {
    if (!isDevWrappingId(wrappingId)) return;
    set((state) => {
      if (state.configuration.wrappingId === wrappingId) return state;
      return { configuration: withTimestamp({ ...state.configuration, wrappingId }) };
    });
  },

  setStemOptionId: (stemOptionId) => {
    if (!isDevStemOptionId(stemOptionId)) return;
    set((state) => {
      if (state.configuration.stemOptionId === stemOptionId) return state;
      return { configuration: withTimestamp({ ...state.configuration, stemOptionId }) };
    });
  },

  setRibbonId: (ribbonId) => {
    if (!isDevRibbonId(ribbonId)) return;
    set((state) => {
      if (state.configuration.ribbonId === ribbonId) return state;
      return { configuration: withTimestamp({ ...state.configuration, ribbonId }) };
    });
  },

  resetBouquet: () => {
    set({ configuration: createInitialConfiguration() });
  },
}));
