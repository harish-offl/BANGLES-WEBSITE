import { CategoryTiles } from "@/components/home/category-tiles";
import { CtaBand } from "@/components/home/cta-band";
import { FaqSection } from "@/components/home/faq-section";
import { Hero } from "@/components/home/hero";
import { MapSection } from "@/components/home/map-section";
import { ProductCatalogue } from "@/components/home/product-catalogue";
import { StorySection } from "@/components/home/story-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { JsonLd } from "@/components/shared/json-ld";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { getCatalog } from "@/lib/data";
import { LEGACY_FACTS, SITE_NAME, SITE_URL } from "@/lib/site";
import type { CatalogDriver } from "@/lib/data/driver";
import type { Product } from "@/types";

/** Catalogue changes rarely; revalidate so new admin edits appear without a redeploy. */
export const revalidate = 300;

/**
 * The catalogue is published as one continuous page, so the home route loads
 * every active product. The drivers cap a single page at 100 rows, so we page
 * through until the full set is collected.
 */
async function getAllProducts(catalog: CatalogDriver): Promise<Product[]> {
  const first = await catalog.listProducts({ pageSize: 100, page: 1, sort: "newest" });
  const products = [...first.items];

  for (let page = 2; page <= first.pageCount; page += 1) {
    const next = await catalog.listProducts({ pageSize: 100, page, sort: "newest" });
    if (next.items.length === 0) break;
    products.push(...next.items);
  }

  return products;
}

export default async function HomePage() {
  const catalog = getCatalog();

  const [categories, products, settings] = await Promise.all([
    catalog.listCategories({ activeOnly: true }),
    getAllProducts(catalog),
    catalog.getSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: SITE_NAME,
          url: SITE_URL,
          image: `${SITE_URL}/images/og-default.jpg`,
          description: LEGACY_FACTS.heroBody,
          address: {
            "@type": "PostalAddress",
            addressLocality: LEGACY_FACTS.location,
            addressRegion: "Tamil Nadu",
            addressCountry: "IN",
          },
          ...(settings.whatsapp_number
            ? { telephone: `+${settings.whatsapp_number.replace(/\D/g, "")}` }
            : {}),
          sameAs: [
            settings.facebook_url,
            settings.instagram_url,
            settings.youtube_url,
            settings.pinterest_url,
          ].filter(Boolean),
        }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${SITE_NAME} catalogue`,
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name,
            ...(product.primary_image_url
              ? { image: `${SITE_URL}${product.primary_image_url}` }
              : {}),
          })),
        }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      <Hero />
      <TrustStrip />
      <CategoryTiles categories={categories} />
      <ProductCatalogue products={products} categories={categories} />
      <StorySection />
      <MapSection
        location={settings.location}
        whatsappNumber={settings.whatsapp_number}
        facebookUrl={settings.facebook_url}
        instagramUrl={settings.instagram_url}
        youtubeUrl={settings.youtube_url}
      />
      <FaqSection whatsappNumber={settings.whatsapp_number} />
      <CtaBand whatsappNumber={settings.whatsapp_number} />
    </>
  );
}
