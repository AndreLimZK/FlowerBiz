import { ShopCatalogue } from "@/components/shop/ShopCatalogue";
import { eyebrowClass, siteMainClass } from "@/components/site/classes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Placeholder ready-made bouquets. Prices are provisional catalogue amounts, not confirmed business prices.",
};

export default function ShopPage() {
  return (
    <main className={siteMainClass}>
      <header className="max-w-2xl">
        <p className={eyebrowClass}>Shop</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-ink md:text-5xl">Placeholder bouquets</h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Ready-made products for this prototype. Prices are provisional catalogue placeholders, not confirmed business
          prices. Picture areas are stand-ins, not photographs. Disabled products stay in the list and are labelled.
          Unavailable products have no placeholder stock. Neither can be added to the cart.
        </p>
      </header>
      <ShopCatalogue />
    </main>
  );
}
