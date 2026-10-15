import type { Metadata } from "next";

import { FaqSection } from "@/components/home/faq-section";
import { MapSection } from "@/components/home/map-section";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { getCatalog } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Contact & visit",
  description:
    "Contact Bangles by Beauty in Pattukottai, Tamil Nadu. Message us on WhatsApp to confirm availability, delivery or a custom design.",
  alternates: { canonical: "/contact" },
};

export const revalidate = 300;

export default async function ContactPage() {
  const settings = await getCatalog().getSettings();
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Contact" }];

  return (
    <div>
      <div className="container-page py-8 sm:py-10">
        <Breadcrumbs items={breadcrumbs} />
        <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

        <header className="mt-5 max-w-3xl">
          <p className="eyebrow mb-3">Get in touch</p>
          <h1 className="section-title text-balance">
            Talk to <em>us</em>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            WhatsApp is the fastest way to reach us. Message us to confirm availability,
            arrange delivery, ask about sizes and colours, or plan a custom design — we reply
            personally during studio hours.
          </p>
        </header>
      </div>

      <MapSection
        location={settings.location}
        whatsappNumber={settings.whatsapp_number}
        facebookUrl={settings.facebook_url}
        instagramUrl={settings.instagram_url}
        youtubeUrl={settings.youtube_url}
      />

      <FaqSection whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
