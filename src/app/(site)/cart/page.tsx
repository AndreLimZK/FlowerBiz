import { CartComingNext } from "@/components/shop/CartComingNext";
import { siteMainClass } from "@/components/site/classes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "The cart page comes next. Added items stay in this browser.",
};

export default function CartPage() {
  return (
    <main className={siteMainClass}>
      <CartComingNext />
    </main>
  );
}
