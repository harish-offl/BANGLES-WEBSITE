import type { Metadata } from "next";

import { getCatalog } from "@/lib/data";
import type { Category, Product } from "@/types";

import AdminInventoryClient from "./AdminInventoryClient";

export const metadata: Metadata = { title: "Inventory Management" };

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGES = 100;

async function listAllProducts(
  catalog: ReturnType<typeof getCatalog>,
): Promise<Product[]> {
  const products: Product[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await catalog.listProducts({
      include_inactive: true,
      include_variants: true,
      pageSize: 100,
      page,
      sort: "newest",
    });

    for (const product of result.items) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        products.push(product);
      }
    }

    if (result.items.length < 100) break;
    if (result.total > 0 && products.length >= result.total) break;
  }

  return products;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

interface InventoryFilters {
  q?: string;
  category: string;
  stock: "all" | "out" | "low" | "no-sizes";
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    category?: string;
    stock?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number(params.pageSize) || DEFAULT_PAGE_SIZE, 1),
    100,
  );
  const q = params.q?.trim() || undefined;
  const category = params.category?.trim() || "all";
  const stock = (params.stock as
    | "all"
    | "out"
    | "low"
    | "no-sizes") ?? "all";

  const catalog = getCatalog();

  const [paginated, categories] = await Promise.all([
    catalog.listProducts({
      include_inactive: true,
      include_variants: true,
      pageSize,
      page,
      q,
      category: category === "all" ? undefined : category,
      sort: "newest",
    }),
    catalog.listCategories(),
  ]);

  // Global stats computed from the full catalogue (accurate dashboard context).
  const allProducts = await listAllProducts(catalog);
  const categoryById = Object.fromEntries(
    categories.map((c) => [c.id, c]),
  ) as Record<string, Category>;

  const totalProducts = allProducts.length;
  const totalVariants = allProducts.reduce(
    (sum, product) => sum + (product.variants?.length ?? 0),
    0,
  );
  const totalStock = allProducts.reduce(
    (sum, p) =>
      sum + (p.variants?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0),
    0,
  );
  const lowStockProducts = allProducts.filter((p) => {
    const stock =
      p.variants?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0;
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStockProducts = allProducts.filter(
    (p) =>
      (p.variants?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0) === 0,
  ).length;

  const pagination: PaginationMeta = {
    page: paginated.page,
    pageSize: paginated.pageSize,
    total: paginated.total,
    pageCount: paginated.pageCount,
  };

  const filters: InventoryFilters = { q, category, stock };

  return (
    <AdminInventoryClient
      products={paginated.items}
      categories={categories}
      categoryById={categoryById}
      pagination={pagination}
      filters={filters}
      totalProducts={totalProducts}
      totalVariants={totalVariants}
      totalStock={totalStock}
      lowStockProducts={lowStockProducts}
      outOfStockProducts={outOfStockProducts}
    />
  );
}
