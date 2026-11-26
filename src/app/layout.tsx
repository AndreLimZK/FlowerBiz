import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "FlowerBiz",
    template: "%s · FlowerBiz",
  },
  description:
    "Arrange a handmade pipe-cleaner bouquet in 3D and submit the design for studio review.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
