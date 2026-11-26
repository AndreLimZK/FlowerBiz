"use client";

import dynamic from "next/dynamic";

const StudioCanvas = dynamic(
  () => import("./StudioCanvas").then((module) => module.StudioCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-studio text-sm text-muted">
        Loading studio…
      </div>
    ),
  },
);

export function BouquetScene() {
  return (
    <div className="relative h-full min-h-0 bg-studio">
      <StudioCanvas />
      <p className="pointer-events-none absolute bottom-4 left-4 bg-panel/90 px-2 py-1 text-xs text-muted">
        Drag to orbit. Scroll to zoom. No flowers are placed.
      </p>
    </div>
  );
}
