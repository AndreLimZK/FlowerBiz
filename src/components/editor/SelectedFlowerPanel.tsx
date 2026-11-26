"use client";

import { useState } from "react";
import { devColourName, devFlowerProduct } from "@/data/flowers";
import { FLOWER_TRANSFORM_LIMITS, useBouquetStore } from "@/stores/bouquetStore";
import type { BouquetFlower } from "@/types/bouquet";

const buttonClassName =
  "rounded-full border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:bg-studio focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

const dangerClassName =
  "rounded-full border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:bg-[#f8ece8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

type Axis = "x" | "y" | "z";

function TransformSlider({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const beginTransform = useBouquetStore((state) => state.beginTransform);
  const endTransform = useBouquetStore((state) => state.endTransform);

  return (
    <div className="mt-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
        <span className="text-xs tabular-nums text-muted">{value.toFixed(2)}</span>
      </div>
      <input
        id={id}
        className="mt-1 h-6 w-full accent-sage"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        aria-valuetext={value.toFixed(2)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          beginTransform();
        }}
        onPointerUp={() => endTransform()}
        onPointerCancel={() => endTransform()}
        onLostPointerCapture={() => endTransform()}
        onKeyDown={() => beginTransform()}
        onKeyUp={() => endTransform()}
        onBlur={() => endTransform()}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function VectorSliders({
  legend,
  flower,
  field,
  min,
  max,
  step,
  onAxis,
}: {
  legend: string;
  flower: BouquetFlower;
  field: "position" | "rotation";
  min: number | { x: number; y: number; z: number };
  max: number | { x: number; y: number; z: number };
  step: number;
  onAxis: (axis: Axis, value: number) => void;
}) {
  const axes: Axis[] = ["x", "y", "z"];
  return (
    <fieldset className="mt-5">
      <legend className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">{legend}</legend>
      {axes.map((axis) => (
        <TransformSlider
          key={axis}
          id={`${flower.instanceId}-${field}-${axis}`}
          label={axis.toUpperCase()}
          min={typeof min === "number" ? min : min[axis]}
          max={typeof max === "number" ? max : max[axis]}
          step={step}
          value={flower[field][axis]}
          onChange={(value) => onAxis(axis, value)}
        />
      ))}
    </fieldset>
  );
}

export function SelectedFlowerPanel() {
  const selectedInstanceId = useBouquetStore((state) => state.selectedInstanceId);
  const flower = useBouquetStore((state) =>
    state.configuration.flowers.find((item) => item.instanceId === state.selectedInstanceId),
  );
  const updateFlowerPosition = useBouquetStore((state) => state.updateFlowerPosition);
  const updateFlowerRotation = useBouquetStore((state) => state.updateFlowerRotation);
  const updateFlowerScale = useBouquetStore((state) => state.updateFlowerScale);
  const duplicateFlower = useBouquetStore((state) => state.duplicateFlower);
  const removeFlower = useBouquetStore((state) => state.removeFlower);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirmingDelete = confirmingId !== null && confirmingId === selectedInstanceId;

  if (!flower) {
    return (
      <section
        aria-label="Selected flower"
        className="shrink-0 rounded-[1.75rem] border border-line bg-panel p-7"
      >
        <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Selected flower</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Click a flower in the preview to select it. Dragging empty space only orbits the camera.
        </p>
      </section>
    );
  }

  const product = devFlowerProduct(flower.productId);
  const name = product?.name ?? "Flower";
  const colour = devColourName(flower.colourId) ?? flower.colourId;
  const { position, rotation, scale } = FLOWER_TRANSFORM_LIMITS;

  return (
    <section aria-label="Selected flower" className="shrink-0 rounded-[1.75rem] border border-line bg-panel p-7">
      <h2 className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Selected flower</h2>
      <p className="mt-4 text-sm text-ink">{name}</p>
      <p className="mt-1 text-sm text-muted">Colour · {colour}</p>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Sliders change only this flower. Position stays near the bouquet, rotation is in radians, and scale stays
        between {scale.min.toFixed(1)} and {scale.max.toFixed(0)}.
      </p>
      {confirmingDelete ? (
        <div className="mt-4 rounded-2xl border border-line bg-studio px-3 py-3">
          <p className="text-sm text-ink">Delete this {name}?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={dangerClassName}
              onClick={() => {
                removeFlower(flower.instanceId);
                setConfirmingId(null);
              }}
            >
              Confirm delete
            </button>
            <button type="button" className={buttonClassName} onClick={() => setConfirmingId(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={buttonClassName} onClick={() => duplicateFlower(flower.instanceId)}>
            Duplicate flower
          </button>
          <button type="button" className={dangerClassName} onClick={() => setConfirmingId(flower.instanceId)}>
            Delete flower
          </button>
        </div>
      )}
      <VectorSliders
        legend="Position (metres)"
        flower={flower}
        field="position"
        min={position.min}
        max={position.max}
        step={position.step}
        onAxis={(axis, value) =>
          updateFlowerPosition(flower.instanceId, { ...flower.position, [axis]: value })
        }
      />
      <VectorSliders
        legend="Rotation (radians)"
        flower={flower}
        field="rotation"
        min={rotation.min}
        max={rotation.max}
        step={rotation.step}
        onAxis={(axis, value) =>
          updateFlowerRotation(flower.instanceId, { ...flower.rotation, [axis]: value })
        }
      />
      <fieldset className="mt-5">
        <legend className="text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase">Scale</legend>
        <TransformSlider
          id={`${flower.instanceId}-scale`}
          label="Uniform"
          min={scale.min}
          max={scale.max}
          step={scale.step}
          value={flower.scale.x}
          onChange={(value) => updateFlowerScale(flower.instanceId, { x: value, y: value, z: value })}
        />
      </fieldset>
    </section>
  );
}
