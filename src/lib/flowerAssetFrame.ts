import * as THREE from "three";

/**
 * Asset frame for one flower.
 *
 * Y is up. Units are metres. The bouquet base is near the world origin, and
 * the stem base of a flower sits at the model origin. A single stem is about
 * 0.25–0.35 m from the stem base to the top of the head. A file outside that
 * frame is scaled to 0.30 m and moved so the stem base is on the origin.
 * Missing head, stem, leaves, or centre names are skipped.
 */
export const FLOWER_STEM_HEIGHT_M = {
  min: 0.25,
  max: 0.35,
  target: 0.3,
} as const;

/** How far a stem base may sit from the origin and still count as authored in-frame. */
export const FLOWER_STEM_BASE_EPSILON_M = 0.001;

const FLOWER_STEM_AXIS_EPSILON_M = 0.005;

/** Parts a later variant may swap or show. A model may include any subset. */
export const FLOWER_PART_NAMES = ["head", "stem", "leaves", "centre"] as const;

export type FlowerPartName = (typeof FLOWER_PART_NAMES)[number];

export type FlowerPartIndex = Partial<Record<FlowerPartName, THREE.Object3D>>;

type FrameCorrection = {
  scale: number;
  position: { x: number; y: number; z: number };
};

const correctionCache = new WeakMap<THREE.Object3D, FrameCorrection>();

const IDENTITY_CORRECTION: FrameCorrection = {
  scale: 1,
  position: { x: 0, y: 0, z: 0 },
};

/** Named object, or undefined when this file has no such part. */
export function flowerPart(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
  if (!name) return undefined;
  return root.getObjectByName(name) ?? undefined;
}

export function findFlowerParts(root: THREE.Object3D): FlowerPartIndex {
  const parts: FlowerPartIndex = {};
  for (const name of FLOWER_PART_NAMES) {
    const object = flowerPart(root, name);
    if (object) parts[name] = object;
  }
  return parts;
}

/** Unique object names on the model, excluding the loader's own wrapper. */
export function listModelPartNames(root: THREE.Object3D): string[] {
  const names: string[] = [];
  root.traverse((child) => {
    if (child !== root && child.name && !names.includes(child.name)) names.push(child.name);
  });
  return names;
}

/**
 * True when the file already contains a material with this exact name.
 * The loader never creates or tints a material to stand in for it.
 */
export function hasMaterialNamed(root: THREE.Object3D, materialKey: string): boolean {
  if (!materialKey) return false;
  let found = false;
  root.traverse((child) => {
    if (found) return;
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (materials.some((material) => material?.name === materialKey)) found = true;
  });
  return found;
}

function cloneFlowerContents(source: THREE.Object3D): THREE.Group {
  const group = new THREE.Group();
  group.name = "flower-asset";
  const children = source.children.length > 0 ? source.children : [source];
  for (const child of children) group.add(child.clone(true));
  return group;
}

function boxedAnchor(box: THREE.Box3): { x: number; y: number; z: number } {
  return {
    x: (box.min.x + box.max.x) / 2,
    y: box.min.y,
    z: (box.min.z + box.max.z) / 2,
  };
}

/** Stem-base centre when a stem part exists; otherwise the bottom centre of the whole model. */
function stemAnchor(root: THREE.Object3D, full: THREE.Box3): { x: number; y: number; z: number } {
  const stem = flowerPart(root, "stem");
  if (!stem) return boxedAnchor(full);
  const stemBox = new THREE.Box3().setFromObject(stem);
  if (stemBox.isEmpty()) return boxedAnchor(full);
  return boxedAnchor(stemBox);
}

function correctionFor(source: THREE.Object3D): FrameCorrection {
  const cached = correctionCache.get(source);
  if (cached) return cached;

  const probe = cloneFlowerContents(source);
  probe.updateMatrixWorld(true);
  const full = new THREE.Box3().setFromObject(probe);
  if (full.isEmpty()) {
    correctionCache.set(source, IDENTITY_CORRECTION);
    return IDENTITY_CORRECTION;
  }

  const height = full.max.y - full.min.y;
  if (height < 1e-6) {
    correctionCache.set(source, IDENTITY_CORRECTION);
    return IDENTITY_CORRECTION;
  }

  const anchor = stemAnchor(probe, full);
  const heightInBand = height >= FLOWER_STEM_HEIGHT_M.min && height <= FLOWER_STEM_HEIGHT_M.max;
  const baseSeated =
    Math.abs(anchor.y) <= FLOWER_STEM_BASE_EPSILON_M &&
    Math.hypot(anchor.x, anchor.z) <= FLOWER_STEM_AXIS_EPSILON_M;
  if (heightInBand && baseSeated) {
    correctionCache.set(source, IDENTITY_CORRECTION);
    return IDENTITY_CORRECTION;
  }

  const scale = heightInBand ? 1 : FLOWER_STEM_HEIGHT_M.target / height;
  probe.scale.setScalar(scale);
  probe.updateMatrixWorld(true);
  const scaledFull = new THREE.Box3().setFromObject(probe);
  const scaledAnchor = stemAnchor(probe, scaledFull);
  const correction: FrameCorrection = {
    scale,
    position: { x: -scaledAnchor.x, y: -scaledAnchor.y, z: -scaledAnchor.z },
  };
  correctionCache.set(source, correction);
  return correction;
}

/**
 * One scene instance of a cached glTF. Geometry and materials stay shared with
 * the cache; the wrapper's scale and position are this instance's frame.
 * `materialKey` is recorded and never applied as a colour.
 */
export function prepareFlowerInstance(source: THREE.Object3D, materialKey?: string): THREE.Group {
  const correction = correctionFor(source);
  const group = cloneFlowerContents(source);
  group.scale.setScalar(correction.scale);
  group.position.set(correction.position.x, correction.position.y, correction.position.z);
  group.updateMatrixWorld(true);
  group.userData.flowerParts = findFlowerParts(group);
  group.userData.partNames = listModelPartNames(group);
  group.userData.materialKey = materialKey ?? "";
  group.userData.materialKeyPresent = materialKey ? hasMaterialNamed(group, materialKey) : false;
  return group;
}
