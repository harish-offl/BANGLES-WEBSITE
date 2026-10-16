import "server-only";

import { DEFAULT_SETTINGS } from "@/lib/site";
import { getAnonServerClient } from "@/lib/supabase/anon-server";
import type {
  Category,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductFilters,
  StoreSettings,
} from "@/types";

import type { CatalogDriver } from "./driver";
import { decodeHtmlEntities, normalizeDescription } from "./text";

/** Strips characters that carry meaning in PostgREST `or=` filter syntax. */
function sanitizeSearch(value: string): string {
  return value.replace(/[%,()'"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

const PRODUCT_SELECT = "*, category:categories(*)";

/**
 * Minimal structural view of a PostgREST filter builder. Supabase's fluent
 * generics are impossible to thread through a helper, so call sites hand the
 * builder in and get the same builder back.
 */
interface FilterBuilder {
  eq: (column: string, value: unknown) => FilterBuilder;
  gte: (column: string, value: unknown) => FilterBuilder;
  lte: (column: string, value: unknown) => FilterBuilder;
  or: (filters: string) => FilterBuilder;
  contains: (column: string, value: unknown) => FilterBuilder;
  in: (column: string, values: unknown[]) => FilterBuilder;
  order: (column: string, options?: { ascending?: boolean }) => FilterBuilder;
}

function applyFilters<T>(query: T, filters: ProductFilters, categoryId?: string | null): T {
  let q = query as unknown as FilterBuilder;

  if (!filters.include_inactive) q = q.eq("is_active", true);
  if (categoryId) q = q.eq("category_id", categoryId);
  if (filters.featured) q = q.eq("is_featured", true);
  if (filters.new_arrivals) q = q.eq("is_new_arrival", true);
  if (typeof filters.minPrice === "number") q = q.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") q = q.lte("price", filters.maxPrice);
  if (filters.ids?.length) q = q.in("id", filters.ids);
  if (filters.colour?.length) q = q.contains("colours", filters.colour);
  if (filters.inStock) q = q.or("stock_quantity.is.null,stock_quantity.gt.0");

  if (filters.q) {
    const term = sanitizeSearch(filters.q);
    if (term) {
      q = q.or(
        `name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`,
      );
    }
  }

  const sortMap: Record<string, [string, "asc" | "desc"]> = {
    newest: ["created_at", "desc"],
    "price-asc": ["price", "asc"],
    "price-desc": ["price", "desc"],
    "name-asc": ["name", "asc"],
    "name-desc": ["name", "desc"],
  };
  const [column, dir] = sortMap[filters.sort ?? "newest"] ?? sortMap.newest;
  q = q.order(column, { ascending: dir === "asc" });

  return q as unknown as T;
}

function hydrate(row: Record<string, unknown> | null): Product | null {
  if (!row) return null;
  const category = (row.category ?? null) as Category | null;
  const product = row as unknown as Product;
  return {
    ...product,
    name: decodeHtmlEntities(product.name),
    description: normalizeDescription(product.description),
    seo_title: product.seo_title ? decodeHtmlEntities(product.seo_title) : product.seo_title,
    seo_description: product.seo_description
      ? decodeHtmlEntities(product.seo_description)
      : product.seo_description,
    category,
    category_name: category?.name ?? null,
  };
}

/** Decodes migrated HTML entities in a category's displayed text. */
function hydrateCategory(category: Category): Category {
  return {
    ...category,
    name: decodeHtmlEntities(category.name),
    description: category.description ? decodeHtmlEntities(category.description) : category.description,
  };
}

export const supabaseDriver: CatalogDriver = {
  mode: "supabase",

  async listProducts(filters = {}): Promise<Paginated<Product>> {
    const supabase = getAnonServerClient();
    const pageSize = Math.min(Math.max(filters.pageSize ?? 24, 1), 100);
    const page = Math.max(filters.page ?? 1, 1);

    let categoryId: string | null = null;
    if (filters.category) {
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", filters.category)
        .maybeSingle();
      categoryId = data?.id ?? "00000000-0000-0000-0000-000000000000";
    }

    let base = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" });
    base = applyFilters(base, filters, categoryId) as typeof base;

    const from = (page - 1) * pageSize;
    const { data, error, count } = await base.range(from, from + pageSize - 1);
    if (error) throw new Error(`Failed to list products: ${error.message}`);

    const total = count ?? 0;
    return {
      items: (data ?? []).map((row) => hydrate(row as Record<string, unknown>)).filter(Boolean) as Product[],
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getProductBySlug(slug): Promise<Product | null> {
    const supabase = getAnonServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(`${PRODUCT_SELECT}, images:product_images(*), variants:product_variants(*)`)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Failed to load product: ${error.message}`);
    return hydrate(data as Record<string, unknown> | null);
  },

  async getProductById(id): Promise<Product | null> {
    const supabase = getAnonServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(`${PRODUCT_SELECT}, images:product_images(*)`)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load product: ${error.message}`);
    return hydrate(data as Record<string, unknown> | null);
  },

  async getProductsByIds(ids): Promise<Product[]> {
    if (!ids.length) return [];
    const supabase = getAnonServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", ids);
    if (error) throw new Error(`Failed to load products: ${error.message}`);
    return (data ?? []).map((row) => hydrate(row as Record<string, unknown>)).filter(Boolean) as Product[];
  },

  async listCategories(options = {}): Promise<Category[]> {
    const supabase = getAnonServerClient();
    let query = supabase
      .from("categories")
      .select("*, products(count)")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (options.activeOnly) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list categories: ${error.message}`);

    return (data ?? []).map((row) => {
      const rest = row as unknown as Record<string, unknown>;
      const products = rest.products as { count?: number }[] | undefined;
      const category = Object.fromEntries(
        Object.entries(rest).filter(([key]) => key !== "products"),
      );
      return hydrateCategory({
        ...(category as unknown as Category),
        product_count: products?.[0]?.count ?? 0,
      });
    });
  },

  async getCategoryBySlug(slug): Promise<Category | null> {
    const supabase = getAnonServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, products(count)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Failed to load category: ${error.message}`);
    if (!data) return null;
    const rest = data as unknown as Record<string, unknown>;
    const products = rest.products as { count?: number }[] | undefined;
    const category = Object.fromEntries(
      Object.entries(rest).filter(([key]) => key !== "products"),
    );
    return hydrateCategory({
      ...(category as unknown as Category),
      product_count: products?.[0]?.count ?? 0,
    });
  },

  async getColours(): Promise<string[]> {
    const supabase = getAnonServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("colours")
      .eq("is_active", true)
      .not("colours", "is", null)
      .limit(5000);
    if (error) throw new Error(`Failed to load colours: ${error.message}`);
    const set = new Set<string>();
    for (const row of data ?? []) {
      for (const c of (row as { colours: string[] }).colours ?? []) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  },

  async getSettings(): Promise<StoreSettings> {
    const supabase = getAnonServerClient();
    const { data, error } = await supabase.from("store_settings").select("key, value");
    if (error || !data) return { ...DEFAULT_SETTINGS };
    const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of data as { key: string; value: unknown }[]) {
      if (row.key in merged) merged[row.key] = row.value;
    }
    return merged as unknown as StoreSettings;
  },

  /**
   * Ranks products by summed `order_items.quantity`. Returns an empty list
   * when no order records exist, which hides the bestsellers section rather
   * than presenting an invented ranking.
   */
  async getBestsellerIds(limit = 8): Promise<string[]> {
    const supabase = getAnonServerClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .not("product_id", "is", null);
    if (error || !data?.length) return [];

    const totals = new Map<string, number>();
    for (const row of data as { product_id: string; quantity: number }[]) {
      totals.set(row.product_id, (totals.get(row.product_id) ?? 0) + row.quantity);
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  },

  async createProduct(input): Promise<Product> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("products")
      .insert(input)
      .select(PRODUCT_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return hydrate(data as Record<string, unknown>) as Product;
  },

  async updateProduct(id, input): Promise<Product> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("products")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(PRODUCT_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return hydrate(data as Record<string, unknown>) as Product;
  },

  async deleteProduct(id): Promise<void> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async createCategory(input): Promise<Category> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.from("categories").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async updateCategory(id, input): Promise<Category> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async deleteCategory(id): Promise<void> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    if ((count ?? 0) > 0) {
      throw new Error("Category still has products. Reassign or remove them first.");
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  /**
   * Orders are private to admins under RLS, so reads and writes both go through
   * the service-role client after the caller has passed an admin check.
   */
  async listOrders(options = {}): Promise<Order[]> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });
    if (options.status) query = query.eq("status", options.status);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list enquiries: ${error.message}`);
    return (data ?? []) as Order[];
  },

  async createOrder(input): Promise<Order> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        status: "pending",
        currency: input.currency,
        subtotal: input.subtotal,
        total_amount: input.subtotal,
        notes: input.notes,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const order = data as Order;
    if (input.items.length) {
      const rows = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name_snapshot: item.productName,
        selected_variant_snapshot: item.variant,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.unitPrice * item.quantity,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(rows);
      if (itemsError) throw new Error(itemsError.message);
    }

    return order;
  },

  async updateOrderStatus(id, status: OrderStatus): Promise<Order> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Order;
  },

  async updateSettings(input): Promise<StoreSettings> {
    const { getServiceRoleClient } = await import("@/lib/supabase/service-role");
    const supabase = getServiceRoleClient();
    const rows = Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({ key, value }));
    if (rows.length) {
      const { error } = await supabase.from("store_settings").upsert(rows, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    return this.getSettings();
  },
};
