import { SiteHeader } from "@/components/site/SiteHeader";
import type { ReactNode } from "react";

/**
 * The bouquet editor keeps a wide desktop shell.
 * The 1100px minimum lives here so shop pages can use a normal column.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh min-w-[1100px] flex-col">
      <SiteHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col">{children}</div>
    </div>
  );
}
