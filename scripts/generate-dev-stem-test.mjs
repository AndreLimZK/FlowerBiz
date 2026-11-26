/**
 * Builds public/models/dev/stem-test.glb from primitive meshes.
 *
 * The file is intentionally outside the flower frame (stem base is not on the
 * origin, and the model is taller than 0.35 m) so the loader can seat it.
 * It is not a product flower and has no textures.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onloadend = null;
      this.onerror = null;
    }

    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(
        (buffer) => {
          this.result = buffer;
          this.onloadend?.();
        },
        (error) => {
          this.onerror?.(error);
        },
      );
    }
  };
}

function material(name, color) {
  return new THREE.MeshStandardMaterial({
    name,
    color,
    roughness: 0.84,
    metalness: 0,
  });
}

const stemMaterial = material("dev-stem", 0x4a6342);
const plainMaterial = material("dev-plain", 0xc47a86);

const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 1, 10), stemMaterial);
stem.name = "stem";
// Cylinder is centered. Base sits at y = 0.4, and the stem is shifted off the origin.
stem.position.set(0.25, 0.9, -0.15);

const leaves = new THREE.Group();
leaves.name = "leaves";
const leafA = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.08), stemMaterial);
leafA.name = "leaf-a";
leafA.position.set(0.36, 0.85, -0.15);
leafA.rotation.z = 0.4;
const leafB = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.07), stemMaterial);
leafB.name = "leaf-b";
leafB.position.set(0.12, 1.05, -0.15);
leafB.rotation.z = -0.5;
leaves.add(leafA, leafB);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), plainMaterial);
head.name = "head";
head.position.set(0.25, 1.52, -0.15);

const centre = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), plainMaterial);
centre.name = "centre";
centre.position.set(0.25, 1.64, -0.02);

const flower = new THREE.Group();
flower.name = "dev-stem-test";
flower.add(stem, leaves, head, centre);
flower.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(flower);
const size = new THREE.Vector3();
box.getSize(size);
console.log(
  "raw frame",
  JSON.stringify({
    min: box.min.toArray().map((value) => Number(value.toFixed(4))),
    max: box.max.toArray().map((value) => Number(value.toFixed(4))),
    size: size.toArray().map((value) => Number(value.toFixed(4))),
  }),
);

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(flower, { binary: true });
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../public/models/dev/stem-test.glb");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(glb));
console.log("wrote", out, Buffer.from(glb).byteLength, "bytes");
