"use client";

import { Gltf } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export type FlowerModelProps = {
  /** `.glb` or `.gltf` URL. When omitted, the procedural stand-in is shown. */
  modelUrl?: string;
};

const stemMaterial = new THREE.MeshStandardMaterial({
  color: "#4a6342",
  roughness: 0.92,
  metalness: 0,
});

const leafMaterial = new THREE.MeshStandardMaterial({
  color: "#5c7c4b",
  roughness: 0.88,
  metalness: 0,
});

const calyxMaterial = new THREE.MeshStandardMaterial({
  color: "#3c5634",
  roughness: 0.9,
  metalness: 0,
});

const outerPetalMaterial = new THREE.MeshStandardMaterial({
  color: "#c94b63",
  roughness: 0.82,
  metalness: 0,
});

const innerPetalMaterial = new THREE.MeshStandardMaterial({
  color: "#e58b98",
  roughness: 0.78,
  metalness: 0,
});

const centreMaterial = new THREE.MeshStandardMaterial({
  color: "#e6b34a",
  roughness: 0.58,
  metalness: 0,
});

function createBladeGeometry(length: number, width: number, thickness: number) {
  const half = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(length * 0.28, half, length * 0.7, half * 0.92, length, width * 0.06);
  shape.bezierCurveTo(length * 0.68, -half * 0.78, length * 0.24, -half * 0.7, 0, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: thickness * 0.28,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -thickness / 2);
  geometry.computeVertexNormals();
  return geometry;
}

const petalGeometry = createBladeGeometry(0.052, 0.034, 0.012);
const leafGeometry = new THREE.SphereGeometry(1, 20, 14);

type PetalRingProps = {
  name: string;
  count: number;
  tilt: number;
  y: number;
  scale: number;
  phase: number;
  material: THREE.Material;
};

function PetalRing({ name, count, tilt, y, scale, phase, material }: PetalRingProps) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = phase + (index / count) * Math.PI * 2;
        const wobble = (index % 2 === 0 ? 1 : -1) * 0.05;
        return { angle, wobble };
      }),
    [count, phase],
  );

  return (
    <group name={name} position={[0, y, 0]}>
      {petals.map(({ angle, wobble }) => (
        <group key={angle.toFixed(4)} rotation={[0, -angle, 0]}>
          <mesh
            geometry={petalGeometry}
            material={material}
            position={[0.012, 0, 0]}
            rotation={[-Math.PI / 2 + wobble, 0, tilt + wobble]}
            scale={scale}
          />
        </group>
      ))}
    </group>
  );
}

function Calyx() {
  const sepals = useMemo(
    () => Array.from({ length: 5 }, (_, index) => (index / 5) * Math.PI * 2),
    [],
  );

  return (
    <group name="calyx" position={[0, -0.01, 0]}>
      {sepals.map((angle) => (
        <group key={angle.toFixed(4)} rotation={[0, -angle, 0]}>
          <mesh
            material={calyxMaterial}
            position={[0.015, -0.004, 0]}
            rotation={[0, 0, -2.35]}
          >
            <coneGeometry args={[0.0065, 0.028, 7]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const leaves = [
  { y: 0.1, angle: 0.7, tilt: 0.58, scale: [0.042, 0.008, 0.02] as const },
  { y: 0.155, angle: 2.15, tilt: 0.46, scale: [0.036, 0.007, 0.017] as const },
  { y: 0.21, angle: 4.05, tilt: 0.64, scale: [0.03, 0.006, 0.014] as const },
];

function Leaves() {
  return (
    <group name="leaves">
      {leaves.map((leaf) => (
        <group key={leaf.y} position={[0, leaf.y, 0]} rotation={[0, leaf.angle, 0]}>
          <mesh
            geometry={leafGeometry}
            material={leafMaterial}
            position={[0.03, 0.012, 0]}
            rotation={[0, 0, leaf.tilt]}
            scale={leaf.scale}
          />
        </group>
      ))}
    </group>
  );
}

/** Metres, Y up, stem base on the origin. Stand-in until a glTF flower is supplied. */
function ProceduralFlower() {
  return (
    <group name="procedural-flower">
      <mesh name="stem" material={stemMaterial} position={[0, 0.1375, 0]}>
        <cylinderGeometry args={[0.0042, 0.0058, 0.275, 12]} />
      </mesh>
      <Leaves />
      <group name="flower-head" position={[0, 0.286, 0]}>
        <mesh name="receptacle" material={calyxMaterial} position={[0, -0.006, 0]}>
          <sphereGeometry args={[0.011, 18, 14]} />
        </mesh>
        <Calyx />
        <PetalRing
          name="petals-outer"
          count={8}
          tilt={0.5}
          y={0}
          scale={1}
          phase={0}
          material={outerPetalMaterial}
        />
        <PetalRing
          name="petals-inner"
          count={6}
          tilt={0.95}
          y={0.008}
          scale={0.68}
          phase={Math.PI / 6}
          material={innerPetalMaterial}
        />
        <mesh name="centre" material={centreMaterial} position={[0, 0.016, 0]} scale={[1, 0.72, 1]}>
          <sphereGeometry args={[0.014, 28, 20]} />
        </mesh>
      </group>
    </group>
  );
}

function LoadedFlower({ url }: { url: string }) {
  return <Gltf src={url} useDraco={false} useMeshOpt={false} />;
}

export function FlowerModel({ modelUrl }: FlowerModelProps) {
  if (modelUrl) {
    return <LoadedFlower url={modelUrl} />;
  }

  return <ProceduralFlower />;
}
