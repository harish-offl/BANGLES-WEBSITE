import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/products/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonLd } from "@/components/shared/json-ld";
import { ListingPagination } from "@/components/shop/listing-pagination";
import { ShopFilters } from "@/components/shop/shop-filters";
import { Button } from "@/components/ui/button";
import { getCatalog } from "@/lib/data";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo/jsonld";
import { buildShopParams, parseShopValue, shopValueToFilters } from "@/lib/shop/params";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse the full collection of handcrafted bangles, bridal sets, hair bands and accessories from Bangles by Beauty.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const value = parseShopValue(searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);

  const catalog = getCatalog();
  const [result, categories, colours, settings, cheapest, priciest] = await Promise.all([
    catalog.listProducts(shopValueToFilters(value, page)),
    catalog.listCategories({ activeOnly: true }),
    catalog.getColours(),
    catalog.getSettings(),
    catalog.listProducts({ sort: "price-asc", pageSize: 1 }),
    catalog.listProducts({ sort: "price-desc", pageSize: 1 }),
  ]);

  const priceFloor = cheapest.items[0]?.price ?? 0;
  const priceCeil = priciest.items[0]?.price ?? 0;
  const baseParams = buildShopParams(value).toString();
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Products" }];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />

      <JsonLd data={itemListJsonLd("Products", result.items)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />

      <header className="mt-5 max-w-3xl">
        <p className="eyebrow mb-3">The collection</p>
        <h1 className="section-title text-balance">
          Shop every <em>piece</em>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {result.total} handcrafted design{result.total === 1 ? "" : "s"} ready to browse.
          {settings.free_shipping_threshold
            ? ` Free delivery on orders above ₹${settings.free_shipping_threshold.toLocaleString("en-IN")}.`
            : ""}
        </p>
      </header>

      <div className="mt-8">
        <ShopFilters
          pathname="/products"
          categories={categories}
          colours={colours}
          priceFloor={priceFloor}
          priceCeil={priceCeil}
          value={value}
          total={result.total}
        />
      </div>

      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="No pieces match your filters"
            description="Try removing a filter, or message us on WhatsApp and we will help you find the right design."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button render={<Link href="/products" />} nativeButton={false} variant="outline">
                  Clear filters
                </Button>
                <Button render={<Link href="/contact" />} nativeButton={false}>
                  Contact us
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <ProductGrid products={result.items} />
            <ListingPagination
              page={result.page}
              pageCount={result.pageCount}
              basePath="/products"
              baseParams={baseParams}
            />
          </>
        )}
      </div>
    </div>
  );
}
