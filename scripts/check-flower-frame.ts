import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  FLOWER_PART_NAMES,
  FLOWER_STEM_HEIGHT_M,
  flowerPart,
  prepareFlowerInstance,
} from "../src/lib/flowerAssetFrame";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function heightOf(object: THREE.Object3D): number {
  const box = new THREE.Box3().setFromObject(object);
  return box.max.y - box.min.y;
}

async function main(): Promise<void> {
  const file = resolve(dirname(fileURLToPath(import.meta.url)), "../public/models/dev/stem-test.glb");
  const bytes = readFileSync(file);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group }>((ok, fail) => {
    loader.parse(arrayBuffer, "", (parsed) => ok(parsed as { scene: THREE.Group }), fail);
  });

  const rawHeight = heightOf(gltf.scene);
  assert(rawHeight > FLOWER_STEM_HEIGHT_M.max, `test file should start above the stem band, was ${rawHeight}`);

  const first = prepareFlowerInstance(gltf.scene, "dev-plain");
  const second = prepareFlowerInstance(gltf.scene, "dev-plain");
  const seatedHeight = heightOf(first);
  assert(
    Math.abs(seatedHeight - FLOWER_STEM_HEIGHT_M.target) < 0.002,
    `seated height should be 0.30 m, was ${seatedHeight}`,
  );

  const stem = flowerPart(first, "stem");
  assert(stem instanceof THREE.Mesh, "stem part missing");
  const stemMesh: THREE.Mesh = stem;
  const stemBox = new THREE.Box3().setFromObject(stemMesh);
  const stemCenter = new THREE.Vector3();
  stemBox.getCenter(stemCenter);
  assert(Math.abs(stemBox.min.y) < 0.002, `stem base should sit on y = 0, was ${stemBox.min.y}`);
  assert(Math.hypot(stemCenter.x, stemCenter.z) < 0.002, "stem axis should sit on the origin");

  for (const name of FLOWER_PART_NAMES) {
    assert(flowerPart(first, name) !== undefined, `missing part ${name}`);
  }
  assert(flowerPart(first, "not-a-part") === undefined, "unknown part name should be skipped");
  assert(first.userData.materialKeyPresent === true, "dev-plain should be present and left untouched");
  const listed = first.userData.partNames;
  assert(Array.isArray(listed) && listed.includes("leaf-a") && listed.includes("leaf-b"), "leaf meshes should stay named");

  const otherStem = flowerPart(second, "stem");
  assert(otherStem instanceof THREE.Mesh, "second stem missing");
  const otherStemMesh: THREE.Mesh = otherStem;
  assert(stemMesh.geometry === otherStemMesh.geometry, "two instances should share one geometry");
  assert(first !== second, "two instances should not be the same object");

  const authored = new THREE.Group();
  const authoredStem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.3, 6));
  authoredStem.name = "stem";
  authoredStem.position.y = 0.15;
  authored.add(authoredStem);
  const kept = prepareFlowerInstance(authored);
  assert(kept.scale.x === 1 && kept.position.length() === 0, "an in-frame stem should not be moved");

  const nameless = new THREE.Group();
  nameless.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1)));
  const seatedNameless = prepareFlowerInstance(nameless, "missing-material");
  assert(flowerPart(seatedNameless, "stem") === undefined, "a model with no parts should still load");
  assert(seatedNameless.userData.materialKeyPresent === false, "a missing material key must not be invented");
  assert(
    Math.abs(heightOf(seatedNameless) - FLOWER_STEM_HEIGHT_M.target) < 0.002,
    "nameless model should still be seated",
  );

  console.log("flower frame ok", {
    rawHeight: Number(rawHeight.toFixed(3)),
    seatedHeight: Number(seatedHeight.toFixed(3)),
    parts: first.userData.partNames,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
