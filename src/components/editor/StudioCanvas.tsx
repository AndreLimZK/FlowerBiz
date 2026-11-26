"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function StudioCanvas() {
  return (
    <Canvas camera={{ position: [1.5, 1.7, 4.2], fov: 35 }} dpr={[1, 2]}>
      <color attach="background" args={["#f6f3ee"]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[4.2, 6.4, 3.2]} intensity={1.15} />
      <directionalLight position={[-3.2, 2.4, -2.2]} intensity={0.28} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[1.05, 80]} />
        <meshStandardMaterial color="#e6dfd4" roughness={1} metalness={0} />
      </mesh>
      <OrbitControls enableDamping makeDefault target={[0, 0.2, 0]} />
    </Canvas>
  );
}
