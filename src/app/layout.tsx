import { CommerceHydration } from "@/components/CommerceHydration";
import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
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
    "Handmade pipe-cleaner bouquets. Browse placeholder ready-made flowers or arrange a design. Shop prices are provisional.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-full bg-studio font-sans text-ink antialiased">
        <CommerceHydration />
        {children}
      </body>
    </html>
  );
}
