import type { Metadata, Viewport } from "next";
import { Big_Shoulders_Display, Inter } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BRABUS Q WAGON 2026 — Built to Be Unreasonable",
  description:
    "The BRABUS Q Wagon 2026. 800HP concept figures. Engineered obsession. An interactive automotive experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-void text-bone font-body antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
