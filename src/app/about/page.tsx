import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TrustStrip } from "@/components/home/trust-strip";
import { FaqSection } from "@/components/home/faq-section";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { getCatalog } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { LEGACY_FACTS } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Bangles by Beauty is a small studio in Pattukottai, Tamil Nadu, making handcrafted silk-thread, kundan and bridal bangles to order.",
  alternates: { canonical: "/about" },
};

const GALLERY = [
  { src: "/images/lifestyle/18.jpg", alt: "Coin and kundan flower bangles styled together" },
  { src: "/images/lifestyle/51.jpg", alt: "Thamarai bangles in red and lemon yellow" },
  { src: "/images/lifestyle/53.jpg", alt: "Ratna bangles in dark green and grey" },
  { src: "/images/lifestyle/54.jpg", alt: "Minimal red and gold bangle design" },
];

const VALUES = [
  {
    title: "Made by hand",
    body: "Each piece is assembled by hand with silk thread, kundan, crystals and traditional motifs.",
  },
  {
    title: "Made to order",
    body: "We craft your pieces after you confirm, so nothing is mass produced.",
  },
  {
    title: "Made with you",
    body: "Every order is confirmed personally over WhatsApp, from design to delivery.",
  },
];

export default async function AboutPage() {
  const settings = await getCatalog().getSettings();
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Our story" }];

  return (
    <div>
      <div className="container-page py-8 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />
        <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

        <header className="mt-5 max-w-3xl">
          <p className="eyebrow mb-3">Our story</p>
          <h1 className="section-title text-balance">
            Handcrafted in <em>Pattukottai</em>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {LEGACY_FACTS.brandName} began as a small family workshop and grew into a studio
            that dresses brides, families and festivals across Tamil Nadu. Every bangle,
            centre clip and hair accessory is made the traditional way — by hand, to order.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl bg-brand-c100">
            <SmartImage
              src={GALLERY[0].src}
              alt={GALLERY[0].alt}
              width={900}
              height={900}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="size-full object-cover"
            />
          </div>
          {GALLERY.slice(1).map((image) => (
            <div key={image.src} className="overflow-hidden rounded-2xl bg-brand-c100">
              <SmartImage
                src={image.src}
                alt={image.alt}
                width={450}
                height={450}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="aspect-square size-full object-cover"
              />
            </div>
          ))}
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="max-w-2xl space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              We work in silk thread, kundan, crystals, mirrors and pearls. From a single
              border bangle to a full bridal set with matching centre clips and hair bands,
              each design is finished by hand and checked before it leaves the studio.
            </p>
            <p>
              Because everything is made to order, please allow{" "}
              <strong className="font-medium text-foreground">5 to 7 days</strong> for your
              order to be prepared before it is dispatched. Delivery is free on orders above ₹
              {LEGACY_FACTS.freeDeliveryThreshold.toLocaleString("en-IN")}, and any delivery
              charge for smaller orders is always confirmed with you first.
            </p>
            <p>
              We love to talk through designs. Message us on WhatsApp and we will help you
              choose colours, sizes and pairings, or create something especially for your
              occasion.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-6")}>
                Shop the collection
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/customize"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-6",
                )}
              >
                Design your own
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-brand-paper p-6">
            <h2 className="font-display text-xl">Why shop with us</h2>
            <ul className="mt-4 space-y-4">
              {VALUES.map((value) => (
                <li key={value.title}>
                  <p className="text-sm font-medium text-foreground">{value.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>

      <TrustStrip />
      <FaqSection whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
