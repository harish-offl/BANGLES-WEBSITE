import "server-only";

import { getCatalog } from "@/lib/data";
import type { Product, ProductFilters } from "@/types";

/** Raw `searchParams` value as Next.js hands it to a page. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const SORTS: NonNullable<ProductFilters["sort"]>[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
];

/** Normalises a `?sort=` value, ignoring anything unrecognised. */
export function parseSort(value: string | string[] | undefined): ProductFilters["sort"] {
  const candidate = first(value);
  return SORTS.includes(candidate as NonNullable<ProductFilters["sort"]>)
    ? (candidate as ProductFilters["sort"])
    : "newest";
}

/**
 * Converts a page's `searchParams` into a driver `ProductFilters`. Kept in one
 * place so the shop, search and collection listings all read the query string
 * identically.
 */
export function parseProductFilters(params: RawSearchParams): ProductFilters {
  const colours = toList(params.colour);
  return {
    q: first(params.q)?.trim() || undefined,
    category: first(params.category)?.trim() || undefined,
    colour: colours.length ? colours : undefined,
    minPrice: toNumber(first(params.minPrice)),
    maxPrice: toNumber(first(params.maxPrice)),
    inStock: first(params.inStock) === "1" || first(params.inStock) === "true" ? true : undefined,
    sort: parseSort(params.sort),
    page: Math.max(1, toNumber(first(params.page)) ?? 1),
    pageSize: 24,
  };
}

/** Reads the current page number from `searchParams`, clamped to >= 1. */
export function parsePage(params: RawSearchParams): number {
  return Math.max(1, toNumber(first(params.page)) ?? 1);
}

/**
 * Products to show alongside a product detail page: other pieces from the same
 * collection first, topped up with recent pieces so the rail is never sparse.
 */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const catalog = getCatalog();
  const picked: Product[] = [];
  const seen = new Set<string>([product.id]);

  if (product.category?.slug) {
    const same = await catalog.listProducts({
      category: product.category.slug,
      pageSize: limit + 1,
      sort: "newest",
    });
    for (const item of same.items) {
      if (picked.length >= limit) break;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      picked.push(item);
    }
  }

  if (picked.length < limit) {
    const recent = await catalog.listProducts({ pageSize: limit + 6, sort: "newest" });
    for (const item of recent.items) {
      if (picked.length >= limit) break;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      picked.push(item);
    }
  }

  return picked;
}
