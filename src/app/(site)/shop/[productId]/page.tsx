import { ProductDetail } from "@/components/shop/ProductDetail";
import { siteMainClass } from "@/components/site/classes";
import { shopProduct } from "@/data/products";
import type { Metadata } from "next";
import { Suspense } from "react";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = shopProduct(productId);
  if (!product) {
    return {
      title: "Not found",
      description: "This id is not in the prototype catalogue.",
    };
  }
  return {
    title: product.name,
    description: `${product.summary} Price is a provisional catalogue placeholder.`,
  };
}

function ProductFallback() {
  return <p className="text-sm text-muted">Loading this product.</p>;
}

async function ProductBody({ params }: ProductPageProps) {
  const { productId } = await params;
  return <ProductDetail productId={productId} />;
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <main className={siteMainClass}>
      <Suspense fallback={<ProductFallback />}>
        <ProductBody params={params} />
      </Suspense>
    </main>
  );
}
