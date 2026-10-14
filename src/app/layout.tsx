import type { Metadata, Viewport } from "next";
import { Cormorant, Italiana, Jost } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "@/components/ui/sonner";
import { getCatalog } from "@/lib/data";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

import "./globals.css";

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italiana",
  display: "swap",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Handcrafted bangles from Pattukottai`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Handcrafted bangles, bridal sets and traditional jewellery made in Pattukottai. Shop border bangles, bridal bangles, glass bangles, kundan hair bands and more.",
  applicationName: SITE_NAME,
  keywords: [
    "bangles",
    "bridal bangles",
    "indian bangles",
    "silk thread bangles",
    "kundan bangles",
    "handmade jewellery",
    "Pattukottai",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Handcrafted bangles from Pattukottai`,
    description:
      "Handcrafted bangles, bridal sets and traditional jewellery made in Pattukottai.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Handcrafted bangles, bridal sets and traditional jewellery made in Pattukottai.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#fdf5f0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = getCatalog();
  const [settings, categories] = await Promise.all([
    catalog.getSettings(),
    catalog.listCategories({ activeOnly: true }),
  ]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        italiana.variable,
        cormorant.variable,
        jost.variable,
        "h-full",
      )}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          Skip to main content
        </a>

        <CartProvider>
          <Header
            categories={categories}
            announcement={settings.announcement ?? null}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} />
          <WhatsAppFab
            phone={settings.whatsapp_number}
            storeName={settings.store_name}
          />
          <Toaster position="top-right" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
