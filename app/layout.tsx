import type { Metadata, Viewport } from "next";
import { Figtree, Source_Serif_4, Red_Hat_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["600", "700"],
  display: "swap",
});

const redHatMono = Red_Hat_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Medicine Stock Finder - Confirmed Chemist Stock in Minutes",
  description:
    "Live medicine availability inquiry across verified neighbourhood pharmacies in tier-2 and tier-3 Indian towns. 1-tap confirmed answers without five shop visits.",
  keywords: ["medicine availability", "pharmacy stock", "chemist finder", "Dolo 650", "Azithral", "local chemist"],
  authors: [{ name: "Medicine Stock Finder Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1F4D3A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${sourceSerif.variable} ${redHatMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink selection:bg-sage/30">
        <I18nProvider>
          <AuthProvider>
            <DisclaimerBanner />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
