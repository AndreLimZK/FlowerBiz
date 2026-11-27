import { BouquetOptionsPanel } from "@/components/editor/BouquetOptionsPanel";
import { BouquetScene } from "@/components/editor/BouquetScene";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { FlowerLibrary } from "@/components/editor/FlowerLibrary";
import { AddCustomToCart } from "@/components/editor/AddCustomToCart";
import { PriceSummary } from "@/components/editor/PriceSummary";
import { SelectedFlowerPanel } from "@/components/editor/SelectedFlowerPanel";

export function BouquetEditor() {
  return (
    <div id="bouquet-editor" className="flex min-h-0 flex-1 flex-col px-10 pt-5 pb-6">
      <EditorToolbar />
      <div className="grid min-h-0 flex-1 grid-cols-[17.5rem_minmax(0,1fr)_22.5rem] gap-5">
        <FlowerLibrary />
        <BouquetScene />
        <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
          <SelectedFlowerPanel />
          <BouquetOptionsPanel />
          <PriceSummary />
          <AddCustomToCart />
        </div>
      </div>
    </div>
  );
}
