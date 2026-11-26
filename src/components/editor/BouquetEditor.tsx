import { BouquetOptionsPanel } from "@/components/editor/BouquetOptionsPanel";
import { BouquetScene } from "@/components/editor/BouquetScene";
import { FlowerLibrary } from "@/components/editor/FlowerLibrary";
import { PriceSummary } from "@/components/editor/PriceSummary";

export function BouquetEditor() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[17.5rem_minmax(0,1fr)_20rem] gap-5 px-10 py-6">
      <FlowerLibrary />
      <BouquetScene />
      <div className="flex h-full min-h-0 flex-col gap-5">
        <div className="min-h-0 flex-1">
          <BouquetOptionsPanel />
        </div>
        <PriceSummary />
      </div>
    </div>
  );
}
