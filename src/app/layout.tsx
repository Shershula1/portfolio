import type { Metadata } from "next";
import { Literata, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin", "cyrillic"],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Даня Ретивых — портфолио",
    template: "%s — Даня Ретивых",
  },
  description:
    "Портфолио Дани Ретивых: неосвещаемая комната, четырёхмерный куб и Evernote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
} >) {
  return (
    <html lang="ru" className={`${manrope.variable} ${literata.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
