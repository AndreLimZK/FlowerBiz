import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "FlowerBiz",
  },
  description:
    "Design a handmade pipe-cleaner bouquet in a live 3D preview. The studio reviews every arrangement before confirming it.",
};

const steps = [
  {
    number: "01",
    title: "Choose flowers",
    body: "Pick approved chenille-stem flowers once the catalogue is ready.",
  },
  {
    number: "02",
    title: "Arrange in 3D",
    body: "Place each flower and orbit the bouquet to inspect it from every side.",
  },
  {
    number: "03",
    title: "Submit for review",
    body: "Send the design to the studio. Nothing is confirmed until it is reviewed.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-6">
        <Link href="/" className="font-serif text-xl tracking-tight">
          FlowerBiz
        </Link>
        <Link
          href="/customise"
          className="text-sm font-medium text-moss underline-offset-4 hover:underline"
        >
          Customiser
        </Link>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-end gap-16 px-8 pt-10 pb-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-moss uppercase">
              Handmade pipe-cleaner bouquets
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-6xl leading-[0.95] tracking-tight">
              Design a bouquet you can turn around.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Compose individual chenille-stem flowers in a live 3D preview,
              then send the design for the studio to review. The preview is a
              way to agree on the arrangement. The studio confirms what can be
              made, and the final price.
            </p>
            <div className="mt-8">
              <Link
                href="/customise"
                className="inline-flex items-center bg-moss px-5 py-3 text-sm font-medium text-white hover:bg-moss-deep"
              >
                Open the customiser
              </Link>
            </div>
          </div>

          <div className="border border-line bg-panel p-4 shadow-[0_24px_60px_-36px_rgba(28,25,23,0.45)]">
            <div className="grid h-80 grid-cols-[0.7fr_1.4fr_0.8fr] gap-2">
              <div className="bg-paper p-3 text-xs text-muted">Library</div>
              <div className="relative bg-studio p-3 text-xs text-muted">
                Preview
                <div className="absolute inset-x-8 bottom-8 h-16 rounded-[100%] border border-line bg-[#e7e1d7]" />
              </div>
              <div className="bg-paper p-3 text-xs text-muted">Summary</div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Desktop editor, empty studio
            </p>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-8 py-16 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number}>
                <p className="font-serif text-sm text-moss">{step.number}</p>
                <h2 className="mt-3 font-serif text-2xl tracking-tight">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-8 py-6 text-sm text-muted">
          Every submitted design is reviewed before the order and the final
          price are confirmed.
        </p>
      </footer>
    </div>
  );
}
