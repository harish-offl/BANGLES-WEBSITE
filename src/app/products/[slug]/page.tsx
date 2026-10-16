import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/products/product-detail";
import { ProductGrid } from "@/components/products/product-grid";
import { Prose } from "@/components/shared/page-shell";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCatalog } from "@/lib/data";
import { getRelatedProducts } from "@/lib/data/query";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getCatalog().getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const title = product.seo_title ?? product.name;
  const description =
    product.seo_description ??
    product.description ??
    `${product.name} — handcrafted jewellery from Bangles by Beauty.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(product.primary_image_url
        ? { images: [{ url: product.primary_image_url }] }
        : {}),
    },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const catalog = getCatalog();
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([
    catalog.getSettings(),
    getRelatedProducts(product, 4),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(product.category
      ? [{ label: product.category.name, href: `/collections/${product.category.slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <ProductDetail
        product={product}
        whatsappNumber={settings.whatsapp_number}
        siteUrl={SITE_URL}
        freeShippingThreshold={settings.free_shipping_threshold}
      />

      {product.description ? (
        <section className="mt-12 max-w-3xl border-t border-border pt-8">
          <h2 className="font-display text-xl text-foreground sm:text-2xl">About this piece</h2>
          <Prose className="mt-4">
            <p>{product.description}</p>
          </Prose>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <SectionHeading
            eyebrow="Keep exploring"
            title={
              <>
                You may also <em>like</em>
              </>
            }
          />
          <div className="mt-8">
            <ProductGrid products={related} priorityCount={0} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
