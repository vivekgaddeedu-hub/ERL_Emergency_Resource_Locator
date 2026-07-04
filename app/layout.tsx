import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "ERL — Emergency Resource Locator",
  description:
    "Seconds Save Lives. The emergency screen that should already exist — fastest responder, correct local number, family notify, and voice control.",
  applicationName: "ERL",
  authors: [{ name: "ERL Team" }],
  keywords: ["emergency", "SOS", "responder", "ETA", "first-aid", "location"],
  openGraph: {
    title: "ERL — Emergency Resource Locator",
    description: "Seconds Save Lives.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D0D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-emergency-shell text-foreground">
        <Navbar />
        <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6">{children}</main>
        <footer className="mx-auto w-full max-w-md px-4 pb-6 text-center text-[10px] uppercase tracking-widest text-muted">
          Map © OpenStreetMap · Routing OSRM · Overpass
        </footer>
        {/* Pre-warm the Speech Recognition shim for the voice screen */}
        <Script id="erl-preflight" strategy="afterInteractive">
          {`window.__ERL_READY__ = true;`}
        </Script>
      </body>
    </html>
  );
}
