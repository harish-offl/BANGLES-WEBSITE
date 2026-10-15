import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JsonLd } from "@/components/shared/json-ld";
import { SmartImage } from "@/components/shared/smart-image";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { getCatalog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore Bangles by Beauty collections — bridal bangles, border bangles, glass bangles, centre clips, brooch pins and more.",
  alternates: { canonical: "/collections" },
};

export const revalidate = 300;

export default async function CollectionsPage() {
  const categories = await getCatalog().listCategories({ activeOnly: true });
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Collections" }];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <header className="mt-5 max-w-3xl">
        <p className="eyebrow mb-3">Browse by collection</p>
        <h1 className="section-title text-balance">
          Our <em>collections</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every collection is handmade in Pattukottai. Choose a style to see the full range of
          designs, colours and prices.
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-brand-paper px-6 py-12 text-center text-sm text-muted-foreground">
          Collections are being updated. Please check back shortly.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/collections/${category.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[var(--shadow-hover)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-c100">
                  <SmartImage
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-lg text-foreground">{category.name}</h2>
                    {typeof category.product_count === "number" ? (
                      <span className="shrink-0 rounded-full bg-brand-c100 px-2.5 py-0.5 text-xs text-gold-strong">
                        {category.product_count} piece{category.product_count === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  {category.description ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-gold-strong">
                    Explore
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
