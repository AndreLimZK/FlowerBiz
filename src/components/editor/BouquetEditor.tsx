import { BouquetOptionsPanel } from "@/components/editor/BouquetOptionsPanel";
import { BouquetScene } from "@/components/editor/BouquetScene";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { FlowerLibrary } from "@/components/editor/FlowerLibrary";
import { PriceSummary } from "@/components/editor/PriceSummary";
import { SelectedFlowerPanel } from "@/components/editor/SelectedFlowerPanel";

export function BouquetEditor() {
  return (
    <div className="flex h-dvh min-w-[1080px] flex-col bg-paper text-ink">
      <EditorToolbar />
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="min-h-0 overflow-y-auto border-r border-line bg-panel">
          <FlowerLibrary />
        </aside>
        <section className="relative min-h-0" aria-label="Bouquet preview">
          <div className="absolute inset-0">
            <BouquetScene />
          </div>
        </section>
        <aside className="flex min-h-0 flex-col overflow-y-auto border-l border-line bg-panel">
          <SelectedFlowerPanel />
          <BouquetOptionsPanel />
          <PriceSummary />
        </aside>
      </div>
    </div>
  );
}
