import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/products/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd } from "@/components/shared/json-ld";
import { ListingPagination } from "@/components/shop/listing-pagination";
import { SortSelect } from "@/components/shop/sort-select";
import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/data";
import { parseSort } from "@/lib/data/query";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 300;

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCatalog().getCategoryBySlug(slug);
  if (!category) return { title: "Collection not found" };

  return {
    title: category.name,
    description:
      category.description ??
      `Shop the ${category.name} collection — handcrafted bangles and accessories from Bangles by Beauty.`,
    alternates: { canonical: `/collections/${category.slug}` },
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const sort = parseSort(searchParams.sort);
  const page = Math.max(1, Number(searchParams.page) || 1);

  const catalog = getCatalog();
  const category = await catalog.getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await catalog.listProducts({
    category: slug,
    sort,
    page,
    pageSize: 24,
  });

  const baseParams = sort && sort !== "newest" ? `sort=${sort}` : "";
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: category.name },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={itemListJsonLd(category.name, result.items)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <header className="mt-5 max-w-3xl">
        <p className="eyebrow mb-3">Collection</p>
        <h1 className="section-title text-balance">{category.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {category.description ??
            `${result.total} handcrafted piece${result.total === 1 ? "" : "s"} in this collection.`}
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
        <p className="text-sm text-muted-foreground">
          {result.total} item{result.total === 1 ? "" : "s"}
        </p>
        <SortSelect pathname={`/collections/${slug}`} baseParams={baseParams} value={sort ?? "newest"} />
      </div>

      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="This collection is being updated. Browse all pieces or message us on WhatsApp for help."
            action={
              <Button render={<Link href="/shop" />} nativeButton={false}>
                Shop all bangles
              </Button>
            }
          />
        ) : (
          <>
            <ProductGrid products={result.items} />
            <ListingPagination
              page={result.page}
              pageCount={result.pageCount}
              basePath={`/collections/${slug}`}
              baseParams={baseParams}
            />
          </>
        )}
      </div>
    </div>
  );
}
