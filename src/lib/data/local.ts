import "server-only";

import fs from "node:fs";
import path from "node:path";

import { DEFAULT_SETTINGS } from "@/lib/site";
import {
  DEFAULT_STATUS_MESSAGES,
  assertValidTransition,
  type OrderStatus,
} from "@/lib/orders/lifecycle";
import type {
  Category,
  CustomerNotification,
  Order,
  OrderStatusHistory,
  Paginated,
  Product,
  ProductFilters,
  StoreSettings,
  UpdateOrderLifecycleInput,
} from "@/types";

import type { CatalogDriver, OrderInput } from "./driver";
import { decodeHtmlEntities, normalizeDescription } from "./text";

interface CatalogFile {
  categories: Category[];
  products: Product[];
}

const SEED_PATH = path.join(process.cwd(), "src", "lib", "data", "catalog.json");
const RUNTIME_DIR = path.join(process.cwd(), ".data");
const RUNTIME_PATH = path.join(RUNTIME_DIR, "catalog.json");
const SETTINGS_PATH = path.join(RUNTIME_DIR, "settings.json");
const ORDERS_PATH = path.join(RUNTIME_DIR, "orders.json");
const ORDER_HISTORY_PATH = path.join(RUNTIME_DIR, "order_history.json");
const NOTIFICATIONS_PATH = path.join(RUNTIME_DIR, "notifications.json");

let cache: { mtimeMs: number; data: CatalogFile } | null = null;

/** Decodes migrated HTML entities in the free-text fields we display. */
function decodeProductText(product: Product): Product {
  return {
    ...product,
    name: decodeHtmlEntities(product.name),
    description: normalizeDescription(product.description),
    seo_title: product.seo_title ? decodeHtmlEntities(product.seo_title) : product.seo_title,
    seo_description: product.seo_description
      ? decodeHtmlEntities(product.seo_description)
      : product.seo_description,
  };
}

function decodeCategoryText(category: Category): Category {
  return {
    ...category,
    name: decodeHtmlEntities(category.name),
    description: category.description ? decodeHtmlEntities(category.description) : category.description,
  };
}

function decodeCatalog(data: CatalogFile): CatalogFile {
  return {
    categories: data.categories.map(decodeCategoryText),
    products: data.products.map(decodeProductText),
  };
}

function readCatalog(): CatalogFile {
  try {
    const stat = fs.statSync(RUNTIME_PATH);
    if (cache && cache.mtimeMs === stat.mtimeMs) return cache.data;
    const parsed = JSON.parse(fs.readFileSync(RUNTIME_PATH, "utf8")) as CatalogFile;
    const data = decodeCatalog(parsed);
    cache = { mtimeMs: stat.mtimeMs, data };
    return data;
  } catch {
    const parsed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8")) as CatalogFile;
    const data = decodeCatalog(parsed);
    cache = { mtimeMs: -1, data };
    return data;
  }
}

function writeCatalog(data: CatalogFile): void {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(RUNTIME_PATH, JSON.stringify(data, null, 2));
  cache = { mtimeMs: fs.statSync(RUNTIME_PATH).mtimeMs, data };
}

/** Enquiry records recorded while Supabase is not configured. */
function readOrders(): Order[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(ORDERS_PATH, "utf8")) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]): void {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}

function readOrderHistory(): OrderStatusHistory[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(ORDER_HISTORY_PATH, "utf8")) as OrderStatusHistory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrderHistory(history: OrderStatusHistory[]): void {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(ORDER_HISTORY_PATH, JSON.stringify(history, null, 2));
}

function readNotifications(): CustomerNotification[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(NOTIFICATIONS_PATH, "utf8")) as CustomerNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotifications(notifications: CustomerNotification[]): void {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(NOTIFICATIONS_PATH, JSON.stringify(notifications, null, 2));
}

/** Mirrors the Supabase sequence: BB-YYMM-##### starting at 1001. */
function nextOrderNumber(orders: Order[]): string {
  const now = new Date();
  const yymm = `${String(now.getUTCFullYear()).slice(-2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const highest = orders.reduce((max, order) => {
    const match = /-(\d+)$/.exec(order.order_number);
    const value = match ? Number(match[1]) : 0;
    return Number.isFinite(value) && value > max ? value : max;
  }, 1000);
  return `BB-${yymm}-${String(highest + 1).padStart(5, "0")}`;
}

function now(): string {
  return new Date().toISOString();
}

function matches(p: Product, f: ProductFilters, categorySlugById: Map<string, string>): boolean {
  if (!f.include_inactive && p.is_active === false) return false;
  if (f.featured && !p.is_featured) return false;
  if (f.new_arrivals && !p.is_new_arrival) return false;
  if (f.ids && !f.ids.includes(p.id)) return false;

  if (f.category) {
    const slug = p.category_id ? categorySlugById.get(p.category_id) : undefined;
    if (slug !== f.category) return false;
  }

  if (f.q) {
    const needle = f.q.trim().toLowerCase();
    if (needle) {
      const haystack = `${p.name} ${p.description} ${p.sku ?? ""} ${p.colours.join(" ")}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }

  if (typeof f.minPrice === "number" && p.price < f.minPrice) return false;
  if (typeof f.maxPrice === "number" && p.price > f.maxPrice) return false;

  if (f.colour && f.colour.length) {
    const have = p.colours.map((c) => c.toLowerCase());
    const wanted = f.colour.map((c) => c.toLowerCase());
    if (!wanted.some((w) => have.includes(w))) return false;
  }

  if (f.inStock && p.stock_quantity !== null && p.stock_quantity <= 0) return false;

  return true;
}

function sortProducts(items: Product[], sort: ProductFilters["sort"]): Product[] {
  const list = [...items];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
      return list.sort(
        (a, b) =>
          (b.created_at ?? "").localeCompare(a.created_at ?? "") ||
          (b.sort_index ?? 0) - (a.sort_index ?? 0),
      );
    default:
      return list.sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));
  }
}

function uniqueSlug(base: string, all: Product[], ignoreId?: string): string {
  let candidate = base || "product";
  let i = 1;
  const taken = new Set(all.filter((p) => p.id !== ignoreId).map((p) => p.slug));
  while (taken.has(candidate)) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

function withCategory(product: Product, categories: Category[]): Product {
  const category = product.category_id
    ? (categories.find((c) => c.id === product.category_id) ?? null)
    : null;
  return { ...product, category, category_name: category?.name ?? null };
}

export const localDriver: CatalogDriver = {
  mode: "local",

  async listProducts(filters = {}): Promise<Paginated<Product>> {
    const { categories, products } = readCatalog();
    const slugById = new Map(categories.map((c) => [c.id, c.slug]));
    const pageSize = Math.min(Math.max(filters.pageSize ?? 24, 1), 100);
    const page = Math.max(filters.page ?? 1, 1);

    const filtered = products.filter((p) => matches(p, filters, slugById));
    const sorted = sortProducts(filtered, filters.sort ?? "newest");
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize).map((p) => withCategory(p, categories));

    return {
      items,
      total: sorted.length,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(sorted.length / pageSize)),
    };
  },

  async getProductBySlug(slug): Promise<Product | null> {
    const { categories, products } = readCatalog();
    const found = products.find((p) => p.slug === slug);
    if (!found) return null;
    const hydrated = withCategory(found, categories);
    return {
      ...hydrated,
      images: hydrated.primary_image_url
        ? [
            {
              id: `${hydrated.id}-img`,
              product_id: hydrated.id,
              image_url: hydrated.primary_image_url,
              storage_path: null,
              alt_text: hydrated.name,
              sort_order: 0,
            },
          ]
        : [],
    };
  },

  async getProductById(id): Promise<Product | null> {
    const { categories, products } = readCatalog();
    const found = products.find((p) => p.id === id);
    return found ? withCategory(found, categories) : null;
  },

  async getProductsByIds(ids): Promise<Product[]> {
    const { categories, products } = readCatalog();
    const set = new Set(ids);
    return products.filter((p) => set.has(p.id)).map((p) => withCategory(p, categories));
  },

  async listCategories(options = {}): Promise<Category[]> {
    const { categories, products } = readCatalog();
    const counts = new Map<string, number>();
    for (const p of products) {
      if (p.is_active === false) continue;
      if (!p.category_id) continue;
      counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
    }
    let list = categories.map((c) => ({ ...c, product_count: counts.get(c.id) ?? 0 }));
    list.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    if (options.activeOnly) list = list.filter((c) => c.is_active);
    return list;
  },

  async getCategoryBySlug(slug): Promise<Category | null> {
    const list = await this.listCategories();
    return list.find((c) => c.slug === slug) ?? null;
  },

  async getCategoryProductIds(categoryId: string): Promise<string[]> {
    const { products } = readCatalog();
    return products
      .filter((p) => p.category_id === categoryId)
      .map((p) => p.id);
  },

  async replaceCategoryProducts(categoryId: string, productIds: string[]): Promise<void> {
    const { categories, products } = readCatalog();
    // In local mode, products have a single category_id. Clear previous assignments
    // to this category, then assign the selected ones.
    for (const p of products) {
      if (p.category_id === categoryId) {
        p.category_id = null;
      }
    }
    for (const id of productIds) {
      const idx = products.findIndex((p) => p.id === id);
      if (idx >= 0) products[idx].category_id = categoryId;
    }
    writeCatalog({ categories, products });
  },

  async listProductsByCategory(
    categoryId: string,
    filters: ProductFilters = {},
  ): Promise<Paginated<Product>> {
    const { categories, products } = readCatalog();
    const assigned = products.filter((p) => p.category_id === categoryId && p.is_active);
    const slugById = new Map(categories.map((c) => [c.id, c.slug]));
    const pageSize = Math.min(Math.max(filters.pageSize ?? 24, 1), 100);
    const page = Math.max(filters.page ?? 1, 1);

    let filtered = assigned.filter((p) => matches(p, filters, slugById));
    filtered = sortProducts(filtered, filters.sort ?? "newest");
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map((p) => withCategory(p, categories));

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  },

  async getColours(): Promise<string[]> {
    const { products } = readCatalog();
    const set = new Set<string>();
    for (const p of products) {
      if (p.is_active === false) continue;
      for (const c of p.colours) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  },

  async getSettings(): Promise<StoreSettings> {
    try {
      const stored = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) as Partial<StoreSettings>;
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  /**
   * The local driver has no order records, so there is no sales data to rank
   * from. Returning an empty list hides the bestsellers section instead of
   * inventing a ranking.
   */
  async getBestsellerIds(): Promise<string[]> {
    return [];
  },

  async createProduct(input): Promise<Product> {
    const { categories, products } = readCatalog();
    const slug = uniqueSlug(input.slug || input.name, products);
    const product: Product = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      slug,
      colours: input.colours ?? [],
      created_at: now(),
      updated_at: now(),
      sort_index: -Date.now(),
    };
    writeCatalog({ categories, products: [product, ...products] });
    return withCategory(product, categories);
  },

  async updateProduct(id, input): Promise<Product> {
    const { categories, products } = readCatalog();
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Product not found");
    const current = products[idx];
    const slug =
      input.slug && input.slug !== current.slug
        ? uniqueSlug(input.slug, products, id)
        : current.slug;
    const updated: Product = { ...current, ...input, slug, updated_at: now() };
    products[idx] = updated;
    writeCatalog({ categories, products });
    return withCategory(updated, categories);
  },

  async deleteProduct(id): Promise<void> {
    const { categories, products } = readCatalog();
    writeCatalog({ categories, products: products.filter((p) => p.id !== id) });
  },

  async createCategory(input): Promise<Category> {
    const { categories, products } = readCatalog();
    const category: Category = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      created_at: now(),
      updated_at: now(),
      product_count: 0,
    };
    writeCatalog({ categories: [...categories, category], products });
    return category;
  },

  async updateCategory(id, input): Promise<Category> {
    const { categories, products } = readCatalog();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Category not found");
    const updated = { ...categories[idx], ...input, updated_at: now() };
    categories[idx] = updated;
    writeCatalog({ categories, products });
    return updated;
  },

  async deleteCategory(id): Promise<void> {
    const { categories, products } = readCatalog();
    const inUse = products.some((p) => p.category_id === id);
    if (inUse) {
      throw new Error("Category still has products. Reassign or remove them first.");
    }
    writeCatalog({ categories: categories.filter((c) => c.id !== id), products });
  },

  async listOrders(options = {}): Promise<Order[]> {
    const orders = readOrders();
    const filtered = options.status ? orders.filter((o) => o.status === options.status) : orders;
    return [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = readOrders();
    return orders.find((o) => o.id === id) ?? null;
  },

  async createOrder(input: OrderInput): Promise<Order> {
    const orders = readOrders();
    const timestamp = now();
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const order: Order = {
      id,
      order_number: nextOrderNumber(orders),
      customer_id: input.customerId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      shipping_address: input.customerAddress,
      customer_state: input.customerState,
      status: "pending",
      currency: input.currency,
      subtotal: input.subtotal,
      total_amount: input.subtotal,
      notes: input.notes,
      created_at: timestamp,
      updated_at: timestamp,
      items: input.items.map((item, index) => ({
        id: `${id}-item-${index + 1}`,
        order_id: id,
        product_id: item.productId,
        product_name_snapshot: item.productName,
        selected_variant_snapshot: item.variant,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.unitPrice * item.quantity,
      })),
    };
    writeOrders([order, ...orders]);
    return order;
  },

  async updateOrderStatus(id, status: OrderStatus): Promise<Order> {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("Enquiry not found");
    const updated: Order = { ...orders[idx], status, updated_at: now() };
    orders[idx] = updated;
    writeOrders(orders);
    return updated;
  },

  async updateOrderLifecycle(input: UpdateOrderLifecycleInput): Promise<Order> {
    assertValidTransition(input.previousStatus, input.newStatus);

    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === input.orderId);
    if (idx < 0) throw new Error("Order not found");

    const timestamp = now();
    const current = orders[idx];
    const updated: Order = {
      ...current,
      status: input.newStatus,
      updated_at: timestamp,
    };

    if (input.newStatus === "confirmed") updated.confirmed_at = timestamp;
    else if (input.newStatus === "processing") updated.processing_at = timestamp;
    else if (input.newStatus === "shipped") updated.shipped_at = timestamp;
    else if (input.newStatus === "out_for_delivery") updated.shipped_at = updated.shipped_at ?? timestamp;
    else if (input.newStatus === "delivered") updated.delivered_at = timestamp;
    else if (input.newStatus === "cancelled") updated.cancelled_at = timestamp;

    orders[idx] = updated;
    writeOrders(orders);

    const history = readOrderHistory();
    history.unshift({
      id: `local-hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      order_id: input.orderId,
      previous_status: input.previousStatus,
      new_status: input.newStatus,
      customer_message: null,
      internal_note: null,
      courier_name: null,
      tracking_number: null,
      tracking_url: null,
      estimated_delivery: null,
      updated_by: input.updatedBy,
      created_at: timestamp,
    });
    writeOrderHistory(history);

    if (updated.customer_id) {
      const notifications = readNotifications();
      notifications.unshift({
        id: `local-notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        customer_id: updated.customer_id,
        order_id: updated.id,
        title: `Order ${updated.order_number} updated`,
        message: DEFAULT_STATUS_MESSAGES[input.newStatus],
        notification_type: input.newStatus,
        is_read: false,
        read_at: null,
        created_at: timestamp,
      });
      writeNotifications(notifications);
    }

    return updated;
  },

  async listOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return readOrderHistory()
      .filter((h) => h.order_id === orderId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  async listCustomerOrders(customerId: string): Promise<Order[]> {
    return readOrders()
      .filter((o) => o.customer_id === customerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getCustomerOrderById(customerId: string, id: string): Promise<Order | null> {
    const order = readOrders().find((o) => o.id === id && o.customer_id === customerId) ?? null;
    return order;
  },

  async listCustomerNotifications(customerId: string): Promise<CustomerNotification[]> {
    return readNotifications()
      .filter((n) => n.customer_id === customerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async markCustomerNotificationRead(id: string, customerId: string): Promise<boolean> {
    const notifications = readNotifications();
    const idx = notifications.findIndex((n) => n.id === id && n.customer_id === customerId);
    if (idx < 0) return false;
    notifications[idx] = { ...notifications[idx], is_read: true, read_at: now() };
    writeNotifications(notifications);
    return true;
  },

  async updateSettings(input): Promise<StoreSettings> {
    const current = await this.getSettings();
    const next = { ...current, ...input };
    fs.mkdirSync(RUNTIME_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2));
    return next;
  },
};
