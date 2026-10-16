import type { Metadata } from "next";

import { DriftWall, type DriftWallItem } from "@/components/effects/drift-wall";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { SmartImage } from "@/components/shared/smart-image";
import { getCatalog } from "@/lib/data";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A gallery of handcrafted bangles, bridal sets and lifestyle images from Bangles by Beauty.",
  alternates: { canonical: "/gallery" },
};

export const revalidate = 300;

const LIFESTYLE_IMAGES = [
  { src: "/images/lifestyle/18.jpg", alt: "Coin and kundan flower bangles styled together" },
  { src: "/images/lifestyle/51.jpg", alt: "Thamarai bangles in red and lemon yellow" },
  { src: "/images/lifestyle/53.jpg", alt: "Ratna bangles in dark green and grey" },
  { src: "/images/lifestyle/54.jpg", alt: "Minimal red and gold bangle design" },
];

interface GalleryImage {
  key: string;
  src: string;
  alt: string;
  /** Present for catalogue pieces so the drifting wall can open them. */
  href?: string;
}

export default async function GalleryPage() {
  const products = await getCatalog().listProducts({ pageSize: 40, sort: "newest" });
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Gallery" }];

  const images: GalleryImage[] = [
    ...LIFESTYLE_IMAGES.map((image, index) => ({
      ...image,
      key: `lifestyle-${index}`,
    })),
    ...products.items
      .filter((p) => p.primary_image_url)
      .map((product, index) => ({
        key: `product-${product.id}-${index}`,
        src: product.primary_image_url as string,
        alt: product.name,
        href: `/products/${product.slug}`,
      })),
  ];

  const driftItems: DriftWallItem[] = images.map((image) => ({
    image: image.src,
    title: image.alt,
    href: image.href,
  }));

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <header className="mt-5 max-w-3xl">
        <p className="eyebrow mb-3">Studio moments</p>
        <h1 className="section-title text-balance">
          From our <em>workshop</em>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          A glimpse of our handcrafted pieces — worn, styled and made with love in Pattukottai.
        </p>
      </header>

      {images.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Photos are being updated. Please check back soon.</p>
      ) : (
        <>
          <section
            aria-label="Interactive wall of our pieces"
            className="mt-8 overflow-hidden rounded-3xl bg-brand-ink"
          >
            <div className="h-[360px] sm:h-[480px] lg:h-[560px]">
              <DriftWall
                items={driftItems}
                columns={5}
                tileWidth={190}
                tileHeight={126}
                gap={16}
                radius={14}
                tilt={14}
                turn={-12}
                perspective={1200}
                depth={110}
                speed={38}
                direction="up"
                variance={0.5}
                parallax={0.6}
                lift={70}
                fade={0.55}
                dim={0.5}
                overlayColor="#302323"
              />
            </div>
          </section>

          <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {images.map((image) => (
              <li key={image.key} className="mb-4 break-inside-avoid">
                <div className="overflow-hidden rounded-2xl border border-border bg-brand-c100">
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    width={900}
                    height={1200}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
