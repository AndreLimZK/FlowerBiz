import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlowerBiz",
    template: "%s · FlowerBiz",
  },
  description:
    "Handmade pipe-cleaner bouquets. Arrange a design and send it for review. The catalogue and estimate appear once the business confirms them.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable} h-full`}
    >
      <body className="h-full bg-studio font-sans text-ink antialiased">
        <div className="flex h-full min-w-[1100px] flex-col">
          <header className="shrink-0 border-b border-line">
            <div className="mx-auto flex h-[4.5rem] w-full max-w-[1440px] items-center justify-between px-10">
              <Link
                href="/"
                className="font-serif text-[1.65rem] leading-none tracking-[-0.03em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
              >
                FlowerBiz
              </Link>
              <nav aria-label="Primary">
                <Link
                  href="/customise"
                  className="text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
                >
                  Customise
                </Link>
              </nav>
            </div>
          </header>
          <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
