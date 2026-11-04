import "server-only";

import { getCatalog } from "@/lib/data";
import type { Category, Order, Paginated, Product } from "@/types";

const MAX_PAGE_SIZE = 100;

/** Fetches products with pagination support. */
export async function getAllProducts(
  filters: { q?: string; categoryId?: string; page?: number; pageSize?: number } = {},
): Promise<Paginated<Product>> {
  const catalog = getCatalog();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);

  return catalog.listProducts({
    include_inactive: true,
    pageSize,
    page,
    q: filters.q,
  });
}

export interface PaginatedProductResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
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
  const [productsResult, categories] = await Promise.all([
    catalog.listProducts({
      include_inactive: true,
      pageSize: MAX_PAGE_SIZE,
      page: 1,
    }),
    catalog.listCategories(),
  ]);
  const products = productsResult.items;

  return {
    totalProducts: productsResult.total,
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

export async function getAdminCategory(id: string): Promise<Category | null> {
  const categories = await getCatalog().listCategories();
  return categories.find((category) => category.id === id) ?? null;
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  return getCatalog().getProductById(id);
}

export async function getAllOrders(): Promise<Order[]> {
  return getCatalog().listOrders();
}

export interface AdminOrderOverview {
  total: number;
  order_confirmed: number;
  packing: number;
  shipped: number;
  outForDelivery: number;
  delivered: number;
}

/**
 * Counts orders by delivery stage for the admin dashboard overview cards.
 */
export async function getAdminOrderOverview(): Promise<AdminOrderOverview> {
  const catalog = getCatalog();
  const orders = await catalog.listOrders();
  const count = (stage: string) =>
    orders.filter((o) => o.delivery_stage === stage).length;
  return {
    total: orders.length,
    order_confirmed: count("order_confirmed"),
    packing: count("packing"),
    shipped: count("shipped"),
    outForDelivery: count("out_for_delivery"),
    delivered: count("delivered"),
  };
}
