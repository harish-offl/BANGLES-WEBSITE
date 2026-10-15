import { CategoryTiles } from "@/components/home/category-tiles";
import { CollectionShowcase, SHOWCASE_SIZE } from "@/components/home/collection-showcase";
import { CtaBand } from "@/components/home/cta-band";
import { FaqSection } from "@/components/home/faq-section";
import { Hero } from "@/components/home/hero";
import { MapSection } from "@/components/home/map-section";
import { ReviewSection } from "@/components/reviews/review-section";
import { StorySection } from "@/components/home/story-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { JsonLd } from "@/components/shared/json-ld";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { getCatalog } from "@/lib/data";
import { LEGACY_FACTS, SITE_NAME, SITE_URL } from "@/lib/site";
import type { ShowcaseGroup } from "@/components/home/collection-showcase";
import type { Category, Product } from "@/types";

/** Catalogue changes rarely; revalidate so new admin edits appear without a redeploy. */
export const revalidate = 300;

/**
 * Loads a short preview of each active collection — a handful of pieces per
 * category rather than the whole catalogue, so the home page stays light. The
 * full collection is one tap away at `/collections/[slug]`.
 */
async function getShowcaseGroups(categories: Category[]): Promise<ShowcaseGroup[]> {
  const catalog = getCatalog();
  const active = categories.filter((category) => category.is_active);

  return Promise.all(
    active.map(async (category) => {
      const result = await catalog.listProducts({
        category: category.slug,
        pageSize: SHOWCASE_SIZE,
        sort: "newest",
      });
      return { category, products: result.items, total: result.total };
    }),
  );
}

export default async function HomePage() {
  const catalog = getCatalog();

  const [categories, settings] = await Promise.all([
    catalog.listCategories({ activeOnly: true }),
    catalog.getSettings(),
  ]);
  const groups = await getShowcaseGroups(categories);
  const showcaseProducts: Product[] = groups.flatMap((group) => group.products);

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
          numberOfItems: showcaseProducts.length,
          itemListElement: showcaseProducts.map((product, index) => ({
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
      <CollectionShowcase groups={groups} />
      <StorySection />
      <ReviewSection
        storeName={settings.store_name}
        whatsappNumber={settings.whatsapp_number}
        siteUrl={SITE_URL}
      />
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
