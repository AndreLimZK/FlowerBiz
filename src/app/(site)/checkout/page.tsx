import { siteMainClass, textLinkClass } from "@/components/site/classes";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout comes next.",
};

export default function CheckoutPage() {
  return (
    <main className={siteMainClass}>
      <h1 className="font-serif text-4xl tracking-[-0.03em] text-ink md:text-5xl">Checkout comes next.</h1>
      <p className="mt-8 text-sm">
        <Link href="/cart" className={textLinkClass}>
          Back to cart
        </Link>
      </p>
    </main>
  );
}
