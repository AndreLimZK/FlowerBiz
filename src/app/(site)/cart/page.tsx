import { CartView } from "@/components/shop/CartView";
import { siteMainClass } from "@/components/site/classes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Review ready-made bouquets and custom designs saved in this browser. Prices and estimates are provisional.",
};

export default function CartPage() {
  return (
    <main className={siteMainClass}>
      <CartView />
    </main>
  );
}
