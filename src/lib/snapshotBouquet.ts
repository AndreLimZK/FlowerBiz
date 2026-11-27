import type { BouquetConfiguration, BouquetFlower } from "@/types/bouquet";

/**
 * Copies the serialisable bouquet fields and nothing else.
 * History, the selected instance, a transform gesture, and any scene object
 * stay behind. An empty bouquet (no placed flowers) is refused.
 */

function copyVec3(value: BouquetFlower["position"] | undefined): BouquetFlower["position"] | null {
  if (
    !value ||
    typeof value.x !== "number" ||
    typeof value.y !== "number" ||
    typeof value.z !== "number" ||
    !Number.isFinite(value.x) ||
    !Number.isFinite(value.y) ||
    !Number.isFinite(value.z)
  ) {
    return null;
  }
  return { x: value.x, y: value.y, z: value.z };
}

function copyFlower(flower: BouquetFlower | undefined): BouquetFlower | null {
  if (!flower) return null;
  if (
    typeof flower.instanceId !== "string" ||
    flower.instanceId.length === 0 ||
    typeof flower.productId !== "string" ||
    flower.productId.length === 0 ||
    typeof flower.colourId !== "string" ||
    flower.colourId.length === 0
  ) {
    return null;
  }
  const position = copyVec3(flower.position);
  const rotation = copyVec3(flower.rotation);
  const scale = copyVec3(flower.scale);
  if (!position || !rotation || !scale) return null;
  return {
    instanceId: flower.instanceId,
    productId: flower.productId,
    colourId: flower.colourId,
    position,
    rotation,
    scale,
  };
}

function copyOptionId(value: string | undefined): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value;
}

/**
 * Snapshot of the bouquet configuration passed in (the editor's current
 * configuration, or any other plain configuration). Returns null when the
 * bouquet has no flowers or the fields are not plain data.
 */
export function snapshotBouquetConfiguration(source: BouquetConfiguration): BouquetConfiguration | null {
  if (!source || source.schemaVersion !== 1 || !Array.isArray(source.flowers) || source.flowers.length === 0) {
    return null;
  }

  const flowers: BouquetFlower[] = [];
  for (const flower of source.flowers) {
    const copy = copyFlower(flower);
    if (!copy) return null;
    flowers.push(copy);
  }

  const wrappingId = copyOptionId(source.wrappingId);
  const stemOptionId = copyOptionId(source.stemOptionId);
  const ribbonId = copyOptionId(source.ribbonId);
  if (!wrappingId || !stemOptionId || !ribbonId) return null;

  const snapshot: BouquetConfiguration = {
    schemaVersion: 1,
    flowers,
    wrappingId,
    stemOptionId,
    ribbonId,
  };
  if (typeof source.createdAt === "string") snapshot.createdAt = source.createdAt;
  if (typeof source.updatedAt === "string") snapshot.updatedAt = source.updatedAt;

  return structuredClone(snapshot);
}
