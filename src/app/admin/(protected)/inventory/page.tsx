import type { Metadata } from "next";

import { getCatalog } from "@/lib/data";
import type { Category, Product } from "@/types";

import AdminInventoryClient from "./AdminInventoryClient";

export const metadata: Metadata = { title: "Inventory Management" };

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

/**
 * The catalog drivers cap a single page at 100 rows. The admin inventory needs
 * the complete catalogue, so walk every page instead of relying on one large
 * (and silently truncated) request.
 */
async function listAllProducts(
  catalog: ReturnType<typeof getCatalog>,
): Promise<Product[]> {
  const products: Product[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await catalog.listProducts({
      include_inactive: true,
      include_variants: true,
      pageSize: PAGE_SIZE,
      page,
      sort: "newest",
    });

    for (const product of result.items) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        products.push(product);
      }
    }

    if (result.items.length < PAGE_SIZE) break;
    if (result.total > 0 && products.length >= result.total) break;
  }

  return products;
}

export default async function AdminInventoryPage() {
  const catalog = getCatalog();
  const [products, categories] = await Promise.all([
    listAllProducts(catalog),
    catalog.listCategories(),
  ]);
  const categoryById = Object.fromEntries(
    categories.map((c) => [c.id, c]),
  ) as Record<string, Category>;

  const totalProducts = products.length;
  const totalVariants = products.reduce(
    (sum, product) => sum + (product.variants?.length ?? 0),
    0,
  );
  const totalStock = products.reduce(
    (sum, p) => sum + (p.variants?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0),
    0,
  );
  const lowStockProducts = products.filter((p) => {
    const stock =
      p.variants?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0;
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStockProducts = products.filter(
    (p) =>
      (p.variants?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0) === 0,
  ).length;

  return (
    <AdminInventoryClient
      products={products}
      categories={categories}
      categoryById={categoryById}
      totalProducts={totalProducts}
      totalVariants={totalVariants}
      totalStock={totalStock}
      lowStockProducts={lowStockProducts}
      outOfStockProducts={outOfStockProducts}
    />
  );
}
