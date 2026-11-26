"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, memo, Suspense, type ReactNode } from "react";
import { FlowerModel } from "@/components/editor/FlowerModel";
import { devFlowerModelUrl } from "@/data/flowers";
import { useBouquetStore } from "@/stores/bouquetStore";
import type { BouquetFlower } from "@/types/bouquet";

type SceneErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type SceneErrorBoundaryState = {
  hasError: boolean;
};

class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Bouquet preview failed:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function ModelNotice({ message }: { message: string }) {
  return (
    <Html center style={{ pointerEvents: "none" }}>
      <p className="w-56 text-center text-sm leading-relaxed text-muted">{message}</p>
    </Html>
  );
}

function StudioLighting() {
  return (
    <>
      <hemisphereLight color="#f8f4ee" groundColor="#e4dcd2" intensity={1.15} />
      <directionalLight position={[2.2, 3.4, 2.6]} intensity={2.35} />
      <directionalLight position={[-2.4, 1.5, 1.2]} intensity={1.05} color="#f4eee6" />
      <directionalLight position={[0.2, 2.1, -2.8]} intensity={1.25} color="#fffaf4" />
      <directionalLight position={[0.3, -1.1, 1.8]} intensity={0.85} color="#f7f2ea" />
    </>
  );
}

const PlacedFlower = memo(function PlacedFlower({ flower }: { flower: BouquetFlower }) {
  const modelUrl = devFlowerModelUrl(flower.productId);

  return (
    <group
      name={`flower-instance-${flower.instanceId}`}
      position={[flower.position.x, flower.position.y, flower.position.z]}
      rotation={[flower.rotation.x, flower.rotation.y, flower.rotation.z]}
      scale={[flower.scale.x, flower.scale.y, flower.scale.z]}
    >
      <SceneErrorBoundary fallback={<ModelNotice message="This flower could not be loaded." />}>
        <Suspense fallback={<ModelNotice message="Loading flower…" />}>
          <FlowerModel modelUrl={modelUrl} />
        </Suspense>
      </SceneErrorBoundary>
    </group>
  );
});

/** The configuration is the only source of flowers. Nothing else mounts one. */
function PlacedFlowers() {
  const flowers = useBouquetStore((state) => state.configuration.flowers);
  return flowers.map((flower) => <PlacedFlower key={flower.instanceId} flower={flower} />);
}

function StudioScene() {
  return (
    <>
      <color attach="background" args={["#f4efe8"]} />
      <StudioLighting />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.09, 40]} />
        <meshBasicMaterial color="#ebe4da" />
      </mesh>
      <PlacedFlowers />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableRotate
        enableZoom
        minDistance={0.22}
        maxDistance={1.8}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI * 0.92}
        target={[0, 0.2, 0]}
      />
    </>
  );
}

export function BouquetScene() {
  const isEmpty = useBouquetStore((state) => state.configuration.flowers.length === 0);

  return (
    <section
      aria-label="Bouquet preview"
      className="relative h-full min-h-0 overflow-hidden rounded-[1.75rem] border border-line bg-[radial-gradient(120%_90%_at_50%_38%,#fbf8f4_0%,#e6ded2_100%)] shadow-[inset_0_0_80px_rgba(90,74,58,0.05)]"
    >
      <SceneErrorBoundary
        fallback={
          <div className="flex h-full items-center justify-center px-10 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              The 3D preview could not be started.
            </p>
          </div>
        }
      >
        <div className="absolute inset-0">
          <Canvas
            shadows={false}
            dpr={[1, 2]}
            camera={{
              position: [0.38, 0.36, 0.62],
              fov: 32,
              near: 0.05,
              far: 30,
            }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0.2, 0);
            }}
          >
            <StudioScene />
          </Canvas>
        </div>
      </SceneErrorBoundary>
      <h2 className="pointer-events-none absolute top-0 left-0 z-10 px-7 pt-6 text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Preview
      </h2>
      {isEmpty ? (
        <p className="pointer-events-none absolute inset-x-0 top-[46%] z-10 px-10 text-center text-sm leading-relaxed text-muted">
          Add a flower from the library. It will appear here.
        </p>
      ) : null}
      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-10 text-center text-xs tracking-wide text-muted">
        Drag to turn · scroll to zoom
      </p>
    </section>
  );
}
