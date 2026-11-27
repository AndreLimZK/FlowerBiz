import type { Metadata } from "next";
import { BouquetEditor } from "@/components/editor/BouquetEditor";

export const metadata: Metadata = {
  title: "Customise",
  description:
    "Arrange a handmade pipe-cleaner bouquet. The catalogue and estimate appear once the business confirms them.",
};

export default function CustomisePage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BouquetEditor />
    </main>
  );
}
