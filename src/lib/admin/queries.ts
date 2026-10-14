import "server-only";

import { getCatalog } from "@/lib/data";
import type { Category, Product } from "@/types";

const MAX_PAGE_SIZE = 100;

/** Fetches every product, including inactive rows, following pagination. */
export async function getAllProducts(
  filters: { q?: string; categoryId?: string } = {},
): Promise<Product[]> {
  const catalog = getCatalog();
  const first = await catalog.listProducts({
    include_inactive: true,
    pageSize: MAX_PAGE_SIZE,
    page: 1,
    q: filters.q,
  });
  const products = [...first.items];
  for (let page = 2; page <= first.pageCount; page += 1) {
    const next = await catalog.listProducts({
      include_inactive: true,
      pageSize: MAX_PAGE_SIZE,
      page,
      q: filters.q,
    });
    products.push(...next.items);
  }
  return products;
}

export interface AdminOverview {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  newArrivals: number;
  outOfStock: number;
  totalCategories: number;
  activeCategories: number;
  missingImages: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const catalog = getCatalog();
  const [products, categories] = await Promise.all([
    getAllProducts(),
    catalog.listCategories(),
  ]);

  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.is_active).length,
    featuredProducts: products.filter((p) => p.is_featured).length,
    newArrivals: products.filter((p) => p.is_new_arrival).length,
    outOfStock: products.filter(
      (p) => p.stock_quantity !== null && p.stock_quantity <= 0,
    ).length,
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.is_active).length,
    missingImages: products.filter((p) => !p.primary_image_url).length,
  };
}

export async function getAdminCategories(): Promise<Category[]> {
  return getCatalog().listCategories();
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  return getCatalog().getProductById(id);
}
