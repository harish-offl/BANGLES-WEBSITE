"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Price } from "@/components/products/price";
import { ProductBadges } from "@/components/products/product-badges";
import { SectionHeading } from "@/components/shared/section-heading";
import { SmartImage } from "@/components/shared/smart-image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

interface ProductCatalogueProps {
  products: Product[];
  categories: Category[];
}

interface ProductGroup {
  key: string;
  slug: string | null;
  name: string;
  items: Product[];
}

const COLUMNS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/**
 * The whole catalogue on a single page. Shoppers either read straight down
 * (products grouped by collection) or narrow the list with the search box and
 * collection chips. Every card carries the full product detail, so no second
 * page is needed to evaluate a piece.
 */
export function ProductCatalogue({ products, categories }: ProductCatalogueProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const activeCategories = useMemo(
    () => categories.filter((c) => c.is_active && (c.product_count ?? 0) > 0),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (activeCategory !== "all" && product.category?.slug !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        product.name,
        product.sku ?? "",
        product.category_name ?? "",
        product.description,
        product.colours.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query, activeCategory]);

  const groups = useMemo<ProductGroup[]>(() => {
    const bySlug = new Map<string, ProductGroup>();
    for (const product of filtered) {
      const slug = product.category?.slug ?? null;
      const key = slug ?? "__uncategorised";
      let group = bySlug.get(key);
      if (!group) {
        group = {
          key,
          slug,
          name: product.category?.name ?? "More designs",
          items: [],
        };
        bySlug.set(key, group);
      }
      group.items.push(product);
    }
    return Array.from(bySlug.values());
  }, [filtered]);

  return (
    <section id="products" className="container-page scroll-mt-24 py-14 sm:py-20">
      <SectionHeading
        eyebrow="The collection"
        title={
          <>
            Every piece, <em>every detail</em>
          </>
        }
        description="Browse the full catalogue — photos, prices, colours and product codes for each design. Add pieces to your bag, then send your enquiry on WhatsApp."
      />

      <div className="mt-8 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="product-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, colour or code…"
            aria-label="Search the catalogue"
            className="h-11 pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <ul className="flex flex-wrap gap-2">
          <li>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              aria-pressed={activeCategory === "all"}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                activeCategory === "all"
                  ? "border-gold bg-brand-c100 font-medium text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-gold/50 hover:text-foreground",
              )}
            >
              All ({products.length})
            </button>
          </li>
          {activeCategories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                aria-pressed={activeCategory === category.slug}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  activeCategory === category.slug
                    ? "border-gold bg-brand-c100 font-medium text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-gold/50 hover:text-foreground",
                )}
              >
                {category.name}
                {typeof category.product_count === "number" ? ` (${category.product_count})` : ""}
              </button>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
          {query.trim() ? ` matching “${query.trim()}”` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-border bg-brand-paper px-6 py-12 text-center text-sm text-muted-foreground">
          No pieces match your search. Try a different colour, name or code — or message us on
          WhatsApp and we will help you find it.
        </p>
      ) : (
        <div className="mt-10 space-y-14">
          {groups.map((group) => (
            <div
              key={group.key}
              id={group.slug ? `cat-${group.slug}` : "cat-more"}
              className="scroll-mt-24"
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h3 className="font-display text-xl text-foreground sm:text-2xl">{group.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {group.items.length} item{group.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <ul className={cn("mt-6", COLUMNS)}>
                {group.items.map((product) => (
                  <li key={product.id}>
                    <CatalogueItem product={product} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CatalogueItem({ product }: { product: Product }) {
  return (
    <article
      id={`product-${product.slug}`}
      className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-c100">
        <SmartImage
          src={product.primary_image_url}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <ProductBadges product={product} className="absolute left-3 top-3 flex flex-col gap-1" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h4 className="font-display text-base leading-snug text-foreground">{product.name}</h4>
          {product.category_name ? (
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
              {product.category_name}
            </p>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        {product.colours.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Available colours">
            {product.colours.map((colour) => (
              <li key={colour}>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-brand-paper px-2 py-0.5 text-[0.65rem] font-normal capitalize text-muted-foreground"
                >
                  {colour}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-end justify-between gap-3">
            <Price price={product.price} compareAtPrice={product.compare_at_price} size="md" />
            {product.sku ? (
              <span className="text-[0.7rem] text-muted-foreground">Code {product.sku}</span>
            ) : null}
          </div>
          <AddToCartButton
            product={product}
            compact
            className="h-10 w-full"
            label="Add to bag"
          />
        </div>
      </div>
    </article>
  );
}
