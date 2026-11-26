import type { OrbitControlsProps } from "@react-three/drei";
import type { RootState } from "@react-three/fiber";
import type { Scene } from "three";

/** Installed for the next phase. This module does not mount a canvas. */
export type SceneLibraries = {
  scene: Scene;
  frame: RootState;
  controls: OrbitControlsProps;
};

export function BouquetScene() {
  return (
    <section
      aria-label="Bouquet preview"
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-line bg-[radial-gradient(120%_90%_at_50%_38%,#fbf8f4_0%,#e6ded2_100%)] shadow-[inset_0_0_80px_rgba(90,74,58,0.05)]"
    >
      <h2 className="px-7 pt-6 text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">
        Preview
      </h2>
      <div className="flex flex-1 flex-col items-center justify-center px-10 pb-24 text-center">
        <p className="font-serif text-[2rem] leading-tight tracking-[-0.03em] text-ink">
          Studio preview
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          The bouquet will appear here, ready to turn and inspect.
        </p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-16 w-[46%] rounded-[100%] bg-[#d9d0c3]/80"
      />
    </section>
  );
}
