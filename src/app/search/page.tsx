import type { Metadata } from "next";

import { ProductGrid } from "@/components/products/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingPagination } from "@/components/shop/listing-pagination";
import { ShopFilters } from "@/components/shop/shop-filters";
import { getCatalog } from "@/lib/data";
import { buildShopParams, parseShopValue, shopValueToFilters } from "@/lib/shop/params";

export const metadata: Metadata = {
  title: "Search",
  description: "Search handcrafted bangles and accessories from Bangles by Beauty.",
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const value = parseShopValue(searchParams);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const hasQuery = Boolean(value.q || value.category || value.colours.length || value.inStock);

  const catalog = getCatalog();
  const [result, categories, colours] = await Promise.all([
    hasQuery
      ? catalog.listProducts(shopValueToFilters(value, page))
      : Promise.resolve({ items: [], total: 0, page: 1, pageSize: 24, pageCount: 1 }),
    catalog.listCategories({ activeOnly: true }),
    catalog.getColours(),
  ]);

  const baseParams = buildShopParams(value).toString();
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Search" }];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mt-5 max-w-3xl">
        <p className="eyebrow mb-3">Find your piece</p>
        <h1 className="section-title text-balance">
          {value.q ? (
            <>
              Results for <em>“{value.q}”</em>
            </>
          ) : (
            <>
              Search the <em>catalogue</em>
            </>
          )}
        </h1>
        {hasQuery ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {result.total} piece{result.total === 1 ? "" : "s"} found.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Search by name, colour or product code, or refine by collection and price.
          </p>
        )}
      </header>

      <div className="mt-8">
        <ShopFilters
          pathname="/search"
          categories={categories}
          colours={colours}
          priceFloor={0}
          priceCeil={0}
          value={value}
          total={result.total}
        />
      </div>

      <div className="mt-8">
        {!hasQuery ? null : result.items.length === 0 ? (
          <EmptyState
            title="No matches found"
            description="Try a different colour, name or code — or message us on WhatsApp and we will help you find it."
          />
        ) : (
          <>
            <ProductGrid products={result.items} />
            <ListingPagination
              page={result.page}
              pageCount={result.pageCount}
              basePath="/search"
              baseParams={baseParams}
            />
          </>
        )}
      </div>
    </div>
  );
}
