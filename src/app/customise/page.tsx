import type { Metadata } from "next";
import { BouquetEditor } from "@/components/editor/BouquetEditor";

export const metadata: Metadata = {
  title: "Customise",
  description:
    "Inspect an empty studio preview and the bouquet customiser layout.",
};

export default function CustomisePage() {
  return <BouquetEditor />;
}
