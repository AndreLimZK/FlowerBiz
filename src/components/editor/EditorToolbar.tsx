"use client";

import { useEffect, useState } from "react";
import { selectCanRedo, selectCanReset, selectCanUndo, useBouquetStore } from "@/stores/bouquetStore";

const buttonClassName =
  "rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-ink transition-colors hover:bg-studio focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:cursor-not-allowed disabled:opacity-40";

export function EditorToolbar() {
  const undo = useBouquetStore((state) => state.undo);
  const redo = useBouquetStore((state) => state.redo);
  const resetBouquet = useBouquetStore((state) => state.resetBouquet);
  const canUndo = useBouquetStore(selectCanUndo);
  const canRedo = useBouquetStore(selectCanRedo);
  const canReset = useBouquetStore(selectCanReset);
  const [confirmingReset, setConfirmingReset] = useState(false);
  if (!canReset && confirmingReset) setConfirmingReset(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.isContentEditable) return;
      if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      if (target instanceof HTMLInputElement && target.type !== "range") return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2">
      <button type="button" className={buttonClassName} disabled={!canUndo} onClick={() => undo()} title="Undo (Ctrl+Z)">
        Undo
      </button>
      <button
        type="button"
        className={buttonClassName}
        disabled={!canRedo}
        onClick={() => redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        Redo
      </button>
      {confirmingReset ? (
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5">
          <p className="text-xs text-ink">Reset this bouquet? Placed flowers and option changes are cleared.</p>
          <button
            type="button"
            className={buttonClassName}
            onClick={() => {
              resetBouquet();
              setConfirmingReset(false);
            }}
          >
            Confirm reset
          </button>
          <button type="button" className={buttonClassName} onClick={() => setConfirmingReset(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={buttonClassName}
          disabled={!canReset}
          onClick={() => setConfirmingReset(true)}
        >
          Reset bouquet
        </button>
      )}
      <p className="ml-auto text-xs text-muted">Drag empty space to orbit. Click a flower to select it.</p>
    </div>
  );
}
