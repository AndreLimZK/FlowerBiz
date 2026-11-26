"use client";

import { devFlowerProduct } from "@/data/flowers";
import { getFlowerQuantities, isSoldOut } from "@/lib/flowerQuantities";
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
 * The configuration and its undo history are plain JSON: ids, numbers, and strings.
 * Three.js objects, refs, and class instances stay in the scene. A placed flower
 * keeps productId and colourId; the scene resolves those to a modelUrl string.
 *
 * Position is metres from the bouquet origin. Y is up and the bouquet base is
 * near the origin. Rotation and scale are clamped here. The scene only reads
 * the store, so a flower cannot drift past these limits.
 */

type Vec3 = BouquetFlower["position"];

/**
 * Position is metres from the bouquet origin (Y up, base near y = 0).
 * Rotation is radians, about ±π. Scale is uniform-capable but stored per axis,
 * each kept inside 0.4–2.
 */
export const FLOWER_TRANSFORM_LIMITS = {
  position: {
    min: { x: -0.28, y: -0.04, z: -0.28 },
    max: { x: 0.28, y: 0.2, z: 0.28 },
    step: 0.01,
  },
  rotation: { min: -3.14, max: 3.14, step: 0.01 },
  scale: { min: 0.4, max: 2, step: 0.01 },
} as const;

const MAX_HISTORY = 50;
const DUPLICATE_OFFSETS = [
  { x: 0.08, z: 0.05 },
  { x: -0.08, z: 0.06 },
  { x: 0.06, z: -0.08 },
  { x: -0.07, z: -0.05 },
  { x: 0.1, z: 0 },
  { x: 0, z: 0.1 },
];
const PLACEMENT_RADIUS = 0.11;

type BouquetActions = {
  addFlower: (productId: string, colourId?: string) => string | null;
  removeFlower: (instanceId: string) => void;
  updateFlowerPosition: (instanceId: string, position: Vec3) => void;
  updateFlowerRotation: (instanceId: string, rotation: Vec3) => void;
  updateFlowerScale: (instanceId: string, scale: Vec3) => void;
  duplicateFlower: (instanceId: string) => string | null;
  selectFlower: (instanceId: string | null) => void;
  /** Opens one undo step for a slider drag. Further transform updates replace the configuration until end. */
  beginTransform: () => void;
  endTransform: () => void;
  undo: () => void;
  redo: () => void;
  setWrappingId: (wrappingId: string) => void;
  setStemOptionId: (stemOptionId: string) => void;
  setRibbonId: (ribbonId: string) => void;
  resetBouquet: () => void;
};

export type BouquetStore = {
  configuration: BouquetConfiguration;
  selectedInstanceId: string | null;
  past: BouquetConfiguration[];
  future: BouquetConfiguration[];
  /** Configuration from before the open slider gesture. Null when no gesture is open. */
  transformGesture: BouquetConfiguration | null;
} & BouquetActions;

function now(): string {
  return new Date().toISOString();
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

function snapshot(configuration: BouquetConfiguration): BouquetConfiguration {
  return structuredClone(configuration);
}

function trimPast(entries: BouquetConfiguration[]): BouquetConfiguration[] {
  return entries.length > MAX_HISTORY ? entries.slice(entries.length - MAX_HISTORY) : entries;
}

function trimFuture(entries: BouquetConfiguration[]): BouquetConfiguration[] {
  return entries.length > MAX_HISTORY ? entries.slice(entries.length - MAX_HISTORY) : entries;
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

function snapClamp(value: number, step: number, min: number, max: number): number {
  const snapped = Math.round(value / step) * step;
  const digits = step >= 0.01 ? 100 : 10000;
  const rounded = Math.round(snapped * digits) / digits;
  return Math.min(max, Math.max(min, rounded));
}

function clampPosition(value: Vec3): Vec3 {
  const { min, max, step } = FLOWER_TRANSFORM_LIMITS.position;
  return {
    x: snapClamp(value.x, step, min.x, max.x),
    y: snapClamp(value.y, step, min.y, max.y),
    z: snapClamp(value.z, step, min.z, max.z),
  };
}

function clampRotation(value: Vec3): Vec3 {
  const { min, max, step } = FLOWER_TRANSFORM_LIMITS.rotation;
  return {
    x: snapClamp(value.x, step, min, max),
    y: snapClamp(value.y, step, min, max),
    z: snapClamp(value.z, step, min, max),
  };
}

function clampScale(value: Vec3): Vec3 {
  const { min, max, step } = FLOWER_TRANSFORM_LIMITS.scale;
  return {
    x: snapClamp(value.x, step, min, max),
    y: snapClamp(value.y, step, min, max),
    z: snapClamp(value.z, step, min, max),
  };
}

function samePoint(a: Vec3, b: Vec3): boolean {
  return (
    Math.abs(a.x - b.x) < 0.000001 &&
    Math.abs(a.y - b.y) < 0.000001 &&
    Math.abs(a.z - b.z) < 0.000001
  );
}

export function sameConfiguration(a: BouquetConfiguration, b: BouquetConfiguration): boolean {
  if (a.wrappingId !== b.wrappingId || a.stemOptionId !== b.stemOptionId || a.ribbonId !== b.ribbonId) {
    return false;
  }
  if (a.flowers.length !== b.flowers.length) return false;
  return a.flowers.every((flower, index) => {
    const other = b.flowers[index];
    return (
      flower.instanceId === other.instanceId &&
      flower.productId === other.productId &&
      flower.colourId === other.colourId &&
      samePoint(flower.position, other.position) &&
      samePoint(flower.rotation, other.rotation) &&
      samePoint(flower.scale, other.scale)
    );
  });
}

export function isPristineConfiguration(configuration: BouquetConfiguration): boolean {
  return (
    configuration.flowers.length === 0 &&
    configuration.wrappingId === DEV_DEFAULT_WRAPPING_ID &&
    configuration.stemOptionId === DEV_DEFAULT_STEM_OPTION_ID &&
    configuration.ribbonId === DEV_DEFAULT_RIBBON_ID
  );
}

export function selectCanUndo(state: BouquetStore): boolean {
  if (state.past.length > 0) return true;
  return state.transformGesture !== null && !sameConfiguration(state.transformGesture, state.configuration);
}

export function selectCanRedo(state: BouquetStore): boolean {
  return state.transformGesture === null && state.future.length > 0;
}

export function selectCanReset(state: BouquetStore): boolean {
  return !isPristineConfiguration(state.configuration);
}

function placementForIndex(index: number): Vec3 {
  if (index <= 0) return { x: 0, y: 0, z: 0 };
  const angle = index * 2.399963229728653;
  return clampPosition({
    x: Math.cos(angle) * PLACEMENT_RADIUS,
    y: 0,
    z: Math.sin(angle) * PLACEMENT_RADIUS,
  });
}

function nextPosition(flowers: readonly BouquetFlower[]): Vec3 {
  for (let index = 0; index < flowers.length + 12; index += 1) {
    const candidate = placementForIndex(index);
    if (!flowers.some((flower) => samePoint(flower.position, candidate))) {
      return candidate;
    }
  }

  return clampPosition({
    x: PLACEMENT_RADIUS + flowers.length * 0.02,
    y: 0,
    z: 0,
  });
}

function offsetDuplicate(origin: Vec3, flowers: readonly BouquetFlower[]): Vec3 {
  for (const step of DUPLICATE_OFFSETS) {
    for (let multiplier = 1; multiplier <= 4; multiplier += 1) {
      const candidate = clampPosition({
        x: origin.x + step.x * multiplier,
        y: origin.y,
        z: origin.z + step.z * multiplier,
      });
      if (!flowers.some((flower) => samePoint(flower.position, candidate))) {
        return candidate;
      }
    }
  }

  return clampPosition({ x: origin.x, y: origin.y + 0.02, z: origin.z });
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

function selectionAfterSwap(
  currentSelection: string | null,
  from: BouquetConfiguration,
  to: BouquetConfiguration,
): string | null {
  if (currentSelection && to.flowers.some((flower) => flower.instanceId === currentSelection)) {
    return currentSelection;
  }
  const fromIds = new Set(from.flowers.map((flower) => flower.instanceId));
  const added = to.flowers.filter((flower) => !fromIds.has(flower.instanceId));
  return added.length === 1 ? added[0].instanceId : null;
}

function closeGesture(state: BouquetStore): BouquetConfiguration[] {
  if (!state.transformGesture) return state.past;
  if (sameConfiguration(state.transformGesture, state.configuration)) return state.past;
  return trimPast([...state.past, state.transformGesture]);
}

type SelectionUpdate = string | null | "keep";

function resolveSelection(
  selection: SelectionUpdate,
  current: string | null,
  configuration: BouquetConfiguration,
): string | null {
  const candidate = selection === "keep" ? current : selection;
  if (candidate && configuration.flowers.some((flower) => flower.instanceId === candidate)) {
    return candidate;
  }
  return null;
}

function commit(
  set: (partial: Partial<BouquetStore>) => void,
  get: () => BouquetStore,
  produce: (configuration: BouquetConfiguration) => BouquetConfiguration | null,
  selection: SelectionUpdate,
) {
  const state = get();
  const past = closeGesture(state);
  const next = produce(state.configuration);
  if (!next || sameConfiguration(state.configuration, next)) {
    const selectedInstanceId = resolveSelection(selection, state.selectedInstanceId, state.configuration);
    if (state.transformGesture || selectedInstanceId !== state.selectedInstanceId) {
      set({
        past,
        transformGesture: null,
        selectedInstanceId,
      });
    }
    return;
  }

  set({
    configuration: next,
    past: trimPast([...past, snapshot(state.configuration)]),
    future: [],
    transformGesture: null,
    selectedInstanceId: resolveSelection(selection, state.selectedInstanceId, next),
  });
}

function applyTransform(
  set: (partial: Partial<BouquetStore>) => void,
  get: () => BouquetStore,
  produce: (configuration: BouquetConfiguration) => BouquetConfiguration | null,
) {
  const state = get();
  const next = produce(state.configuration);
  if (!next || sameConfiguration(state.configuration, next)) return;

  if (state.transformGesture) {
    set({ configuration: next });
    return;
  }

  set({
    configuration: next,
    past: trimPast([...state.past, snapshot(state.configuration)]),
    future: [],
  });
}

export const useBouquetStore = create<BouquetStore>()((set, get) => ({
  configuration: createInitialConfiguration(),
  selectedInstanceId: null,
  past: [],
  future: [],
  transformGesture: null,

  addFlower: (productId, colourId) => {
    const resolvedColourId = resolveColourId(productId, colourId);
    if (!resolvedColourId) return null;
    if (isSoldOut(getFlowerQuantities(), productId, resolvedColourId)) return null;

    const instanceId = crypto.randomUUID();
    commit(
      set,
      get,
      (configuration) => {
        const flower: BouquetFlower = {
          instanceId,
          productId,
          colourId: resolvedColourId,
          position: nextPosition(configuration.flowers),
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        };
        return withTimestamp(configuration, [...configuration.flowers, flower]);
      },
      instanceId,
    );
    return instanceId;
  },

  removeFlower: (instanceId) => {
    commit(
      set,
      get,
      (configuration) => {
        const flowers = configuration.flowers.filter((flower) => flower.instanceId !== instanceId);
        if (flowers.length === configuration.flowers.length) return null;
        return withTimestamp(configuration, flowers);
      },
      get().selectedInstanceId === instanceId ? null : "keep",
    );
  },

  updateFlowerPosition: (instanceId, position) => {
    const next = copyVec3(position);
    if (!next) return;
    const clamped = clampPosition(next);
    applyTransform(set, get, (configuration) =>
      mapFlower(configuration, instanceId, (flower) =>
        samePoint(flower.position, clamped) ? flower : { ...flower, position: clamped },
      ),
    );
  },

  updateFlowerRotation: (instanceId, rotation) => {
    const next = copyVec3(rotation);
    if (!next) return;
    const clamped = clampRotation(next);
    applyTransform(set, get, (configuration) =>
      mapFlower(configuration, instanceId, (flower) =>
        samePoint(flower.rotation, clamped) ? flower : { ...flower, rotation: clamped },
      ),
    );
  },

  updateFlowerScale: (instanceId, scale) => {
    const next = copyVec3(scale);
    if (!next) return;
    const clamped = clampScale(next);
    applyTransform(set, get, (configuration) =>
      mapFlower(configuration, instanceId, (flower) =>
        samePoint(flower.scale, clamped) ? flower : { ...flower, scale: clamped },
      ),
    );
  },

  duplicateFlower: (instanceId) => {
    const source = get().configuration.flowers.find((flower) => flower.instanceId === instanceId);
    if (!source) return null;
    if (isSoldOut(getFlowerQuantities(), source.productId, source.colourId)) return null;

    const duplicateId = crypto.randomUUID();
    commit(
      set,
      get,
      (configuration) => {
        const current = configuration.flowers.find((flower) => flower.instanceId === instanceId);
        if (!current) return null;
        const duplicate: BouquetFlower = {
          instanceId: duplicateId,
          productId: current.productId,
          colourId: current.colourId,
          position: offsetDuplicate(current.position, configuration.flowers),
          rotation: clampRotation(current.rotation),
          scale: clampScale(current.scale),
        };
        return withTimestamp(configuration, [...configuration.flowers, duplicate]);
      },
      duplicateId,
    );
    return duplicateId;
  },

  selectFlower: (instanceId) => {
    set((state) => {
      if (instanceId === null) {
        return state.selectedInstanceId === null ? state : { selectedInstanceId: null };
      }
      if (!state.configuration.flowers.some((flower) => flower.instanceId === instanceId)) return state;
      if (state.selectedInstanceId === instanceId) return state;
      return { selectedInstanceId: instanceId };
    });
  },

  beginTransform: () => {
    const state = get();
    if (state.transformGesture) return;
    set({ transformGesture: snapshot(state.configuration) });
  },

  endTransform: () => {
    const state = get();
    if (!state.transformGesture) return;
    if (sameConfiguration(state.transformGesture, state.configuration)) {
      set({ transformGesture: null });
      return;
    }
    set({
      past: trimPast([...state.past, state.transformGesture]),
      future: [],
      transformGesture: null,
    });
  },

  undo: () => {
    const state = get();
    if (state.transformGesture && !sameConfiguration(state.transformGesture, state.configuration)) {
      const restored = snapshot(state.transformGesture);
      set({
        configuration: restored,
        transformGesture: snapshot(restored),
        selectedInstanceId: selectionAfterSwap(state.selectedInstanceId, state.configuration, restored),
      });
      return;
    }

    if (state.past.length === 0) {
      if (state.transformGesture) set({ transformGesture: null });
      return;
    }

    const previous = state.past[state.past.length - 1];
    const restored = snapshot(previous);
    set({
      past: state.past.slice(0, -1),
      future: trimFuture([...state.future, snapshot(state.configuration)]),
      configuration: restored,
      transformGesture: state.transformGesture ? snapshot(restored) : null,
      selectedInstanceId: selectionAfterSwap(state.selectedInstanceId, state.configuration, restored),
    });
  },

  redo: () => {
    const state = get();
    if (state.transformGesture || state.future.length === 0) return;
    const next = state.future[state.future.length - 1];
    const restored = snapshot(next);
    set({
      future: state.future.slice(0, -1),
      past: trimPast([...state.past, snapshot(state.configuration)]),
      configuration: restored,
      selectedInstanceId: selectionAfterSwap(state.selectedInstanceId, state.configuration, restored),
    });
  },

  setWrappingId: (wrappingId) => {
    if (!isDevWrappingId(wrappingId)) return;
    commit(
      set,
      get,
      (configuration) =>
        configuration.wrappingId === wrappingId ? null : withTimestamp({ ...configuration, wrappingId }),
      "keep",
    );
  },

  setStemOptionId: (stemOptionId) => {
    if (!isDevStemOptionId(stemOptionId)) return;
    commit(
      set,
      get,
      (configuration) =>
        configuration.stemOptionId === stemOptionId
          ? null
          : withTimestamp({ ...configuration, stemOptionId }),
      "keep",
    );
  },

  setRibbonId: (ribbonId) => {
    if (!isDevRibbonId(ribbonId)) return;
    commit(
      set,
      get,
      (configuration) =>
        configuration.ribbonId === ribbonId ? null : withTimestamp({ ...configuration, ribbonId }),
      "keep",
    );
  },

  resetBouquet: () => {
    const state = get();
    if (isPristineConfiguration(state.configuration)) {
      if (state.transformGesture || state.selectedInstanceId) {
        set({
          past: closeGesture(state),
          transformGesture: null,
          selectedInstanceId: null,
        });
      }
      return;
    }

    commit(set, get, () => createInitialConfiguration(), null);
  },
}));
