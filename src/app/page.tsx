import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-10 pt-20 pb-24">
      <div className="max-w-2xl">
        <p className="text-[0.72rem] font-medium tracking-[0.2em] text-sage uppercase">
          Handmade pipe-cleaner bouquets
        </p>
        <h1 className="mt-6 font-serif text-6xl leading-[1.05] tracking-[-0.03em] text-ink">
          A bouquet, arranged by you and reviewed by us.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
          FlowerBiz makes handmade bouquets from pipe cleaners. You will choose
          the flowers, arrange them in a preview, and send the design for the
          business to review before the order is confirmed.
        </p>
        <div className="mt-10">
          <Link
            href="/customise"
            className="inline-flex items-center rounded-full bg-ink px-6 py-3 text-sm text-studio transition-colors hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
          >
            Open the customiser
          </Link>
        </div>
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted">
          The flower catalogue and the estimate appear once the business
          confirms them. Every design is reviewed before the final price.
        </p>
      </div>
    </main>
  );
}
