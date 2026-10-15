import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshCw, ShieldCheck, Truck } from "lucide-react";

import { ProductGallery } from "@/components/products/product-gallery";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
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

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            {product.category ? (
              <Link
                href={`/collections/${product.category.slug}`}
                className="text-xs uppercase tracking-[0.16em] text-gold-strong hover:underline"
              >
                {product.category.name}
              </Link>
            ) : null}
            <h1 className="mt-2 font-display text-2xl leading-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
          </div>

          <ProductPurchasePanel
            product={product}
            whatsappNumber={settings.whatsapp_number}
            siteUrl={SITE_URL}
          />

          <dl className="grid grid-cols-1 gap-2 border-t border-border pt-5 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Product code</dt>
              <dd className="text-foreground">{product.sku ?? "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="text-foreground">{product.category_name ?? "—"}</dd>
            </div>
            {product.colours.length > 0 ? (
              <div className="flex gap-2 sm:col-span-2">
                <dt className="text-muted-foreground">Colours</dt>
                <dd className="capitalize text-foreground">{product.colours.join(", ")}</dd>
              </div>
            ) : null}
          </dl>

          <ul className="grid gap-3 sm:grid-cols-3">
            <li className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <Truck className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
              <span>
                {settings.free_shipping_threshold
                  ? `Free delivery above ₹${settings.free_shipping_threshold.toLocaleString("en-IN")}`
                  : "Delivery confirmed on enquiry"}
              </span>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <RefreshCw className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
              <span>Handmade to order in 5–7 days</span>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" aria-hidden="true" />
              <span>Confirm details with us on WhatsApp</span>
            </li>
          </ul>
        </div>
      </div>

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
