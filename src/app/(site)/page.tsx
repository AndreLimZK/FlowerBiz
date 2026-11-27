import { FeaturedProducts } from "@/components/shop/FeaturedProducts";
import { PageSection } from "@/components/site/PageSection";
import { eyebrowClass, pillButtonClass, pillGhostClass, siteMainClass, textLinkClass } from "@/components/site/classes";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "Handmade pipe-cleaner flowers. Browse placeholder bouquets or arrange one in the customiser. Shop prices are provisional.",
};

export default function HomePage() {
  return (
    <main className={`${siteMainClass} gap-16 md:gap-20`}>
      <section className="max-w-2xl" aria-labelledby="home-title">
        <p className={eyebrowClass}>Prototype</p>
        <h1 id="home-title" className="mt-6 font-serif text-4xl leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl md:text-6xl">
          Handmade pipe-cleaner flowers.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          FlowerBiz makes bouquets from pipe cleaners. This site is a prototype: the shop lists placeholder products,
          and the prices are provisional until the business confirms them.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop" className={pillButtonClass}>
            Browse bouquets
          </Link>
          <Link href="/customise" className={pillGhostClass}>
            Customise
          </Link>
        </div>
      </section>

      <section aria-labelledby="featured-title">
        <h2 id="featured-title" className="font-serif text-3xl tracking-[-0.03em] text-ink md:text-4xl">
          Featured placeholders
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Ready-made products from the mock catalogue. Names, stock, and prices are stand-ins. The swatches are not
          photographs.
        </p>
        <FeaturedProducts />
      </section>

      <PageSection id="handmade" eyebrow="The flowers" title="Handmade, and kept">
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          These flowers are pipe cleaners, made by hand. They are not a fresh bunch, so the same object can be kept and
          put out again. This prototype does not state a lifespan, a cleaning method, or which designs the business will
          sell.
        </p>
      </PageSection>

      <PageSection id="how-it-works" eyebrow="How it works" title="Browse, order, then receive">
        <ol className="grid list-none gap-8 md:grid-cols-3">
          <li>
            <p className={eyebrowClass}>01</p>
            <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em] text-ink">Browse or customise</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Choose a{" "}
              <Link href="/shop" className={textLinkClass}>
                ready-made bouquet
              </Link>{" "}
              or{" "}
              <Link href="/customise" className={textLinkClass}>
                arrange one in the customiser
              </Link>
              .
            </p>
          </li>
          <li>
            <p className={eyebrowClass}>02</p>
            <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em] text-ink">Place an order</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Add a ready-made bouquet to the cart and place the order from there. Payment and delivery choices are
              later prototype screens. The cart count stays in this browser.
            </p>
          </li>
          <li>
            <p className={eyebrowClass}>03</p>
            <h3 className="mt-3 font-serif text-2xl tracking-[-0.03em] text-ink">Review and receive</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A custom design is reviewed before it is confirmed. A ready-made bouquet skips that review. The finished
              piece is then collected or received. Timing and delivery prices are not confirmed here.
            </p>
          </li>
        </ol>
      </PageSection>

      <PageSection id="shop-cta" eyebrow="Shop" title="See the placeholder catalogue">
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Open the shop to filter, search, and read each provisional price. Nothing on that page is a confirmed business
          price.
        </p>
        <div className="mt-8">
          <Link href="/shop" className={pillButtonClass}>
            Browse bouquets
          </Link>
        </div>
      </PageSection>
    </main>
  );
}
