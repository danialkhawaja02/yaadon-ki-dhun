import type { Metadata, Viewport } from "next";
import { Manrope, Rozha_One, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const rozha = Rozha_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rozha",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yaadon Ki Dhun - Pakistani 80, 90's songs",
  description: "Step into an old Pakistani neighborhood cassette shop and listen to classic ghazals, emerging pop, and vintage film music.",
  icons: {
    icon: "/pic.webp",
    shortcut: "/pic.webp",
    apple: "/pic.webp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${rozha.variable} ${ibmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-charcoal text-cream font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
