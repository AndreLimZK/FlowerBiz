import { textLinkClass } from "@/components/site/classes";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="max-w-md">
          <p className="font-serif text-xl tracking-[-0.03em] text-ink">FlowerBiz</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Handmade pipe-cleaner flowers. This catalogue is a prototype. Prices are provisional
            placeholders, not confirmed business prices.
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-5 text-sm">
          <Link href="/shop" className={textLinkClass}>
            Shop
          </Link>
          <Link href="/customise" className={textLinkClass}>
            Customise
          </Link>
        </nav>
      </div>
    </footer>
  );
}
