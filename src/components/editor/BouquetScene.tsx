"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
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

/** R3F treats a pointer movement above this as a drag, not a click. */
const CLICK_DELTA = 2;

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
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

function setCanvasCursor(event: ThreeEvent<PointerEvent>, cursor: string) {
  const target = event.nativeEvent.target;
  if (target instanceof HTMLElement) target.style.cursor = cursor;
}

function isClick(event: ThreeEvent<MouseEvent>) {
  return event.delta <= CLICK_DELTA && event.nativeEvent.button === 0;
}

const PlacedFlower = memo(function PlacedFlower({
  flower,
  selected,
}: {
  flower: BouquetFlower;
  selected: boolean;
}) {
  const selectFlower = useBouquetStore((state) => state.selectFlower);
  const modelUrl = devFlowerModelUrl(flower.productId);

  const selectThisFlower = (event: ThreeEvent<MouseEvent>) => {
    if (!isClick(event)) return;
    event.stopPropagation();
    selectFlower(flower.instanceId);
  };

  return (
    <group name={`flower-instance-${flower.instanceId}`} position={[flower.position.x, flower.position.y, flower.position.z]}>
      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} onClick={selectThisFlower}>
          <ringGeometry args={[0.055, 0.072, 48]} />
          <meshBasicMaterial color="#66725c" toneMapped={false} />
        </mesh>
      ) : null}
      <group
        rotation={[flower.rotation.x, flower.rotation.y, flower.rotation.z]}
        scale={[flower.scale.x, flower.scale.y, flower.scale.z]}
        onPointerOver={(event) => {
          event.stopPropagation();
          setCanvasCursor(event, "pointer");
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setCanvasCursor(event, "");
        }}
        onClick={selectThisFlower}
      >
        <SceneErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <FlowerModel
              modelUrl={modelUrl}
              productId={flower.productId}
              colourId={flower.colourId}
              selected={selected}
            />
          </Suspense>
        </SceneErrorBoundary>
        {selected ? (
          <mesh position={[0, 0.3, 0]}>
            <torusGeometry args={[0.072, 0.0035, 8, 40]} />
            <meshBasicMaterial color="#66725c" toneMapped={false} />
          </mesh>
        ) : null}
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.06, 0.042, 0.38, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
});

/** The configuration is the only source of flowers. Nothing else mounts one. */
function PlacedFlowers() {
  const flowers = useBouquetStore((state) => state.configuration.flowers);
  const selectedInstanceId = useBouquetStore((state) => state.selectedInstanceId);

  return flowers.map((flower) => (
    <PlacedFlower key={flower.instanceId} flower={flower} selected={flower.instanceId === selectedInstanceId} />
  ));
}

function StudioScene() {
  const selectFlower = useBouquetStore((state) => state.selectFlower);

  return (
    <>
      <color attach="background" args={["#f4efe8"]} />
      <StudioLighting />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={(event) => {
          if (!isClick(event)) return;
          event.stopPropagation();
          selectFlower(null);
        }}
      >
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
  const selectFlower = useBouquetStore((state) => state.selectFlower);

  return (
    <section
      aria-label="Bouquet preview"
      className="relative h-full min-h-0 overflow-hidden rounded-[1.75rem] border border-line bg-[radial-gradient(120%_90%_at_50%_38%,#fbf8f4_0%,#e6ded2_100%)] shadow-[inset_0_0_80px_rgba(90,74,58,0.05)]"
    >
      <SceneErrorBoundary
        fallback={
          <div className="flex h-full items-center justify-center px-10 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-muted">The 3D preview could not be started.</p>
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
            onPointerMissed={() => selectFlower(null)}
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
          Add a flower from the library. Click it here to select it, then move it from the panel on the right.
        </p>
      ) : null}
      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-10 text-center text-xs tracking-wide text-muted">
        Drag empty space to orbit · scroll to zoom · click a flower to select
      </p>
    </section>
  );
}
